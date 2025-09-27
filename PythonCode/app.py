import streamlit as st
import google.generativeai as genai
import json
import os
from datetime import datetime
from textblob import TextBlob
import requests
import pandas as pd
from io import StringIO


GEMINI_API_KEY = "AIzaSyAippZNO5L0bBzsOBOQxnegLTSuGTl4iuo" 
genai.configure(api_key=GEMINI_API_KEY)


YOUTUBE_API_KEY = "AIzaSyCudGJFJ9GRJ9DYmCkTf9FqOMm6nd1qmv4"


model = genai.GenerativeModel('gemini-1.5-flash')


CHAT_DATA_FILE = 'data/chats.json'

class MentalHealthChatbot:
    def __init__(self):
        self.ensure_data_directory()
        self.load_chat_history()
    
    def ensure_data_directory(self):
        """Ensure data directory exists"""
        if not os.path.exists('data'):
            os.makedirs('data')
    
    def load_chat_history(self):
        """Load chat history from file"""
        try:
            if os.path.exists(CHAT_DATA_FILE):
                with open(CHAT_DATA_FILE, 'r') as f:
                    return json.load(f)
            return []
        except:
            return []
    
    def save_chat_history(self, chat_data):
        """Save chat history to file"""
        try:
            with open(CHAT_DATA_FILE, 'w') as f:
                json.dump(chat_data, f, indent=2)
        except Exception as e:
            st.error(f"Error saving chat history: {e}")
    
    def analyze_sentiment(self, text):
        """Analyze sentiment using TextBlob"""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        if polarity > 0.1:
            sentiment = "Positive"
        elif polarity < -0.1:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        
        return {
            "sentiment": sentiment,
            "polarity": polarity,
            "subjectivity": subjectivity
        }
    
    def get_youtube_recommendations(self, sentiment, mood_keywords):
        """Get YouTube video recommendations based on sentiment"""
        try:
            # Create search query based on sentiment
            if sentiment == "Negative":
                search_queries = [
                    "meditation stress relief",
                    "positive thinking motivation",
                    "anxiety relief techniques",
                    "mental health support"
                ]
            elif sentiment == "Positive":
                search_queries = [
                    "mindfulness meditation",
                    "personal growth motivation",
                    "happiness wellness tips"
                ]
            else:
                search_queries = [
                    "mental wellness tips",
                    "self care routine",
                    "mindfulness exercises"
                ]
            
            recommendations = []
            for query in search_queries[:2]:  # Limit to 2 queries
                url = f"https://www.googleapis.com/youtube/v3/search"
                params = {
                    'part': 'snippet',
                    'q': query,
                    'key': YOUTUBE_API_KEY,
                    'type': 'video',
                    'maxResults': 3,
                    'order': 'relevance'
                }
                
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    for item in data.get('items', []):
                        video_info = {
                            'title': item['snippet']['title'],
                            'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                            'description': item['snippet']['description'][:150] + "...",
                            'category': query
                        }
                        recommendations.append(video_info)
            
            return recommendations
        except Exception as e:
            st.error(f"Error fetching YouTube recommendations: {e}")
            return []
    
    def get_blog_recommendations(self, sentiment):
        """Get blog recommendations based on sentiment"""
        blog_recommendations = {
            "Negative": [
                {
                    "title": "10 Ways to Overcome Negative Thoughts",
                    "url": "https://www.psychologytoday.com/us/blog/the-moment-youth/201803/10-ways-overcome-negative-thoughts",
                    "description": "Practical strategies to break the cycle of negative thinking."
                },
                {
                    "title": "Managing Stress and Anxiety",
                    "url": "https://www.helpguide.org/articles/stress/stress-management.htm",
                    "description": "Evidence-based techniques for managing stress and anxiety."
                }
            ],
            "Positive": [
                {
                    "title": "Building Resilience and Mental Strength",
                    "url": "https://www.verywellmind.com/ways-to-become-more-resilient-2795063",
                    "description": "How to maintain and build upon positive mental health."
                },
                {
                    "title": "Mindfulness for Daily Life",
                    "url": "https://www.mindful.org/meditation/mindfulness-getting-started/",
                    "description": "Incorporating mindfulness practices into your routine."
                }
            ],
            "Neutral": [
                {
                    "title": "Mental Health Maintenance Tips",
                    "url": "https://www.mentalhealth.gov/basics/what-is-mental-health",
                    "description": "General tips for maintaining good mental health."
                }
            ]
        }
        return blog_recommendations.get(sentiment, [])
    
    def generate_response(self, user_input, chat_history):
        """Generate response using Gemini API"""
        try:
            # Analyze sentiment
            sentiment_analysis = self.analyze_sentiment(user_input)
            
            # Create context from chat history
            context = ""
            if chat_history:
                recent_messages = chat_history[-5:]  # Last 5 messages for context
                context = "Previous conversation context:\n"
                for msg in recent_messages:
                    context += f"User: {msg.get('user_message', '')}\nAssistant: {msg.get('bot_response', '')}\n"
            
            # Create prompt for Gemini
            prompt = f"""
            You are a compassionate mental health support chatbot. Your role is to provide empathetic, supportive responses while being mindful that you're not a replacement for professional therapy.

            Current user message: {user_input}
            Detected sentiment: {sentiment_analysis['sentiment']} (polarity: {sentiment_analysis['polarity']:.2f})
            
            {context}
            
            Guidelines:
            1. Be empathetic and understanding
            2. Provide supportive responses
            3. If the user seems to be in crisis, encourage them to seek professional help
            4. Ask follow-up questions to better understand their situation
            5. Provide practical coping strategies when appropriate
            6. Keep responses conversational and warm
            
            Please provide a supportive response:
            """
            
            response = model.generate_content(prompt)
            return response.text, sentiment_analysis
            
        except Exception as e:
            st.error(f"Error generating response: {e}")
            return "I'm here to listen and support you. Could you tell me more about how you're feeling?", self.analyze_sentiment(user_input)
    
    def export_chat_summary(self, chat_history):
        """Export chat summary for sharing with psychologist"""
        if not chat_history:
            return "No chat history available."
        
        # Analyze overall sentiment patterns
        sentiments = []
        for chat in chat_history:
            if 'sentiment_analysis' in chat:
                sentiments.append(chat['sentiment_analysis']['sentiment'])
        
        sentiment_summary = {
            'Positive': sentiments.count('Positive'),
            'Negative': sentiments.count('Negative'),
            'Neutral': sentiments.count('Neutral')
        }
        
        # Create summary
        summary = f"""
MENTAL HEALTH CHAT SESSION SUMMARY
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

SENTIMENT ANALYSIS OVERVIEW:
- Positive messages: {sentiment_summary['Positive']}
- Negative messages: {sentiment_summary['Negative']}
- Neutral messages: {sentiment_summary['Neutral']}
- Total messages: {len(chat_history)}

KEY THEMES AND CONCERNS:
"""
        
        # Add recent conversations
        summary += "\nRECENT CONVERSATIONS:\n"
        for i, chat in enumerate(chat_history[-10:], 1):  # Last 10 conversations
            timestamp = chat.get('timestamp', 'Unknown time')
            user_msg = chat.get('user_message', '')
            bot_response = chat.get('bot_response', '')
            sentiment = chat.get('sentiment_analysis', {}).get('sentiment', 'Unknown')
            
            summary += f"\n{i}. [{timestamp}] - Sentiment: {sentiment}\n"
            summary += f"   User: {user_msg[:100]}{'...' if len(user_msg) > 100 else ''}\n"
            summary += f"   Response: {bot_response[:100]}{'...' if len(bot_response) > 100 else ''}\n"
        
        summary += "\n\nNOTE: This summary is generated by an AI chatbot and should be used as supplementary information alongside professional assessment."
        
        return summary

def main():
    st.set_page_config(
        page_title="Mental Health Support Chatbot",
        page_icon="🧠",
        layout="wide"
    )
    
    # Initialize chatbot
    if 'chatbot' not in st.session_state:
        st.session_state.chatbot = MentalHealthChatbot()
    
    # Initialize session state
    if 'messages' not in st.session_state:
        st.session_state.messages = []
    
    if 'chat_history' not in st.session_state:
        st.session_state.chat_history = st.session_state.chatbot.load_chat_history()
    
    # Sidebar for navigation
    with st.sidebar:
        st.title("🧠 Mental Health Support")
        
        page = st.selectbox(
            "Navigate to:",
            ["Chat Interface", "Analytics Dashboard", "Export Summary", "Recommendations"]
        )
        
        if st.button("Clear Current Chat"):
            st.session_state.messages = []
            st.rerun()
        
        if st.button("View Chat History"):
            st.session_state.show_history = not st.session_state.get('show_history', False)
    
    if page == "Chat Interface":
        st.title("💬 Mental Health Support Chatbot")
        st.markdown("*I'm here to listen and provide support. Remember, I'm not a replacement for professional therapy.*")
        
        # Chat interface
        chat_container = st.container()
        
        with chat_container:
            # Display chat messages
            for message in st.session_state.messages:
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])
                    if message["role"] == "assistant" and "sentiment" in message:
                        st.caption(f"Detected sentiment: {message['sentiment']}")
        
        # Chat input
        if prompt := st.chat_input("How are you feeling today?"):
            # Add user message to chat
            st.session_state.messages.append({"role": "user", "content": prompt})
            
            with st.chat_message("user"):
                st.markdown(prompt)
            
            # Generate bot response
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    response, sentiment_analysis = st.session_state.chatbot.generate_response(
                        prompt, st.session_state.chat_history
                    )
                
                st.markdown(response)
                st.caption(f"Detected sentiment: {sentiment_analysis['sentiment']}")
                
                # Add to chat history
                chat_entry = {
                    'timestamp': datetime.now().isoformat(),
                    'user_message': prompt,
                    'bot_response': response,
                    'sentiment_analysis': sentiment_analysis
                }
                st.session_state.chat_history.append(chat_entry)
                st.session_state.chatbot.save_chat_history(st.session_state.chat_history)
                
                # Add assistant message to session
                st.session_state.messages.append({
                    "role": "assistant", 
                    "content": response,
                    "sentiment": sentiment_analysis['sentiment']
                })
    
    elif page == "Analytics Dashboard":
        st.title("📊 Analytics Dashboard")
        
        if st.session_state.chat_history:
            # Sentiment analysis over time
            df_data = []
            for chat in st.session_state.chat_history:
                if 'sentiment_analysis' in chat:
                    df_data.append({
                        'timestamp': chat['timestamp'],
                        'sentiment': chat['sentiment_analysis']['sentiment'],
                        'polarity': chat['sentiment_analysis']['polarity'],
                        'subjectivity': chat['sentiment_analysis']['subjectivity']
                    })
            
            if df_data:
                df = pd.DataFrame(df_data)
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Sentiment Distribution")
                    sentiment_counts = df['sentiment'].value_counts()
                    st.bar_chart(sentiment_counts)
                
                with col2:
                    st.subheader("Polarity Over Time")
                    st.line_chart(df.set_index('timestamp')['polarity'])
                
                st.subheader("Recent Chat Statistics")
                st.metric("Total Messages", len(st.session_state.chat_history))
                st.metric("Average Polarity", f"{df['polarity'].mean():.2f}")
                st.metric("Most Common Sentiment", df['sentiment'].mode().iloc[0])
        else:
            st.info("No chat data available yet. Start chatting to see analytics!")
    
    elif page == "Recommendations":
        st.title("🎯 Personalized Recommendations")
        
        if st.session_state.chat_history:
            # Get latest sentiment
            latest_sentiment = st.session_state.chat_history[-1].get('sentiment_analysis', {}).get('sentiment', 'Neutral')
            latest_message = st.session_state.chat_history[-1].get('user_message', '')
            
            st.subheader(f"Based on your recent sentiment: {latest_sentiment}")
            
            # YouTube recommendations
            st.subheader("🎥 YouTube Video Recommendations")
            if YOUTUBE_API_KEY != "YOUR_YOUTUBE_API_KEY_HERE":
                youtube_recs = st.session_state.chatbot.get_youtube_recommendations(latest_sentiment, latest_message)
                for rec in youtube_recs[:6]:
                    with st.expander(f"🎬 {rec['title']}"):
                        st.write(rec['description'])
                        st.write(f"Category: {rec['category']}")
                        st.write(f"[Watch Video]({rec['url']})")
            else:
                st.warning("YouTube API key not configured. Add your YouTube Data API key to get video recommendations.")
            
            # Blog recommendations
            st.subheader("📚 Blog Article Recommendations")
            blog_recs = st.session_state.chatbot.get_blog_recommendations(latest_sentiment)
            for rec in blog_recs:
                with st.expander(f"📖 {rec['title']}"):
                    st.write(rec['description'])
                    st.write(f"[Read Article]({rec['url']})")
        else:
            st.info("Start chatting to get personalized recommendations!")
    
    elif page == "Export Summary":
        st.title("📤 Export Chat Summary")
        
        if st.session_state.chat_history:
            st.markdown("### Export options for sharing with healthcare professionals")
            
            col1, col2 = st.columns(2)
            
            with col1:
                if st.button("Generate Summary"):
                    summary = st.session_state.chatbot.export_chat_summary(st.session_state.chat_history)
                    st.session_state.generated_summary = summary
            
            with col2:
                if st.button("Download as Text File"):
                    if 'generated_summary' in st.session_state:
                        st.download_button(
                            label="Download Summary",
                            data=st.session_state.generated_summary,
                            file_name=f"mental_health_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                            mime="text/plain"
                        )
            
            if 'generated_summary' in st.session_state:
                st.subheader("Generated Summary")
                st.text_area("Summary", st.session_state.generated_summary, height=400)
        else:
            st.info("No chat history available to export.")

if __name__ == "__main__":
    main()
