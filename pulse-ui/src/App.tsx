import './App.css'
import SentimentStats  from './components/SentimentStats';
import YoutubeSub from './components/YoutubeSub'

function App() {
  return (
    <>
      <YoutubeSub/>
      <h1 className="text-2xl font-bold text-center mt-6">Live Sentiment Stats</h1>
      <SentimentStats/>
    </>
  )
}

export default App
