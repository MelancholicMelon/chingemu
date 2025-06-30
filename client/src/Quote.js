import React, {useState} from 'react'
import './App.css' // IMporting css provided

function Quote(props) {
  const [Quote, setMyState] = useState ({vote: 0, language: 'jp'}) // this state only need vote as variable
  const voteColor = Quote.vote > 0 ? 'green' : Quote.vote < 0 ? 'red' : 'black'; // color value for positive/negative votes
  const msg = props.language === 'jp' ? props.msg_jp : (props.language === 'en' ? props.msg_en : 'error')
  function upVote(){              // function to increase the value for vote
    setMyState(prev => {
      return {...prev, vote: prev.vote+1}  // vote is the only value in state, so no need for prev...
    })
  }
  function downVote(){            // function to decrease the value for vote
    setMyState(prev => {
      return {...prev, vote: prev.vote-1}  // same explanation for upVote
    })
  }

  return (<div className="card-1">
        <div className = "content">{msg}</div>
        <hr></hr>
        <div className = "name">{props.source}</div>
        <hr></hr>
        <div className = "container">
            <button className = "vote-button" onClick = {upVote}>❤️</button>
            <button className = "vote-button" onClick = {downVote}>👎</button>
            <div className = "vote-button" style={{ color: voteColor }}>Vote: {Quote.vote}</div>
        </div>
    </div>);
}


export default Quote;
