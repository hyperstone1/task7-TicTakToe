import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { combinations } from '../utils/constants';
import Box from '../components/Box';
import io from 'socket.io-client';
import { random } from '../utils/random';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const socket = io(process.env.REACT_APP_WS_SERVER);

const Home = () => {
  const [game, setGame] = useState(Array(9).fill(''));
  const [turnNumber, setTurnNumber] = useState(0);
  const [myTurn, setMyTurn] = useState(true);
  const [winner, setWinner] = useState(false);
  const [xo, setXO] = useState('X');
  const [player, setPlayer] = useState('');
  const [hasOpponent, setHasOpponent] = useState(false);
  const [share, setShare] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paramsRoom = params.get('room');
  const [room, setRoom] = useState(paramsRoom);
  const [turnData, setTurnData] = useState(false);

  const sendTurn = (index) => {
    if (!game[index] && !winner && myTurn && hasOpponent) {
      socket.emit('reqTurn', JSON.stringify({ index, value: xo, room }));
    }
  };

  const sendRestart = () => {
    socket.emit('reqRestart', JSON.stringify({ room }));
  };

  const restart = () => {
    setGame(Array(9).fill(''));
    setWinner(false);
    setTurnNumber(0);
    setMyTurn(false);
  };

  useEffect(() => {
    combinations.forEach((c) => {
      if (game[c[0]] === game[c[1]] && game[c[0]] === game[c[2]] && game[c[0]] !== '') {
        setWinner(true);
      }
    });

    if (turnNumber === 0) {
      setMyTurn(xo === 'X' ? true : false);
    }
  }, [game, turnNumber, xo]);

  useEffect(() => {
    socket.on('playerTurn', (json) => {
      setTurnData(json);
    });
    socket.on('restart', () => {
      restart();
    });

    socket.on('opponent_joined', () => {
      setHasOpponent(true);
      setShare(false);
    });
  }, []);

  useEffect(() => {
    if (turnData) {
      const data = JSON.parse(turnData);
      let g = [...game];
      if (!g[data.index] && !winner) {
        g[data.index] = data.value;
        setGame(g);
        setTurnNumber(turnNumber + 1);
        setTurnData(false);
        setMyTurn(!myTurn);
        setPlayer(data.value);
      }
    }
  }, [turnData, game, turnNumber, winner, myTurn]);

  useEffect(() => {
    if (paramsRoom) {
      setXO('O');
      socket.emit('join', paramsRoom);
      setRoom(paramsRoom);
      setMyTurn(false);
    } else {
      const newRoomName = random();
      socket.emit('create', newRoomName);
      setRoom(newRoomName);
      setMyTurn(true);
    }
  }, [paramsRoom]);
  return (
    <div className="container">
      <h2> Room id: {room}</h2>
      <Button onClick={() => setShare(!share)} variant="primary">
        Share room
      </Button>
      {share ? (
        <>
          <p className="share">Share link: </p>
          <input
            className="input"
            type="text"
            value={`${window.location.href}?room=${room}`}
            readOnly
          />
        </>
      ) : null}
      <p className="turn">Turn: {myTurn ? 'You' : 'Opponent'}</p>
      <p className="opponent">{hasOpponent ? '' : 'Waiting for opponent...'}</p>
      <p>
        {winner || turnNumber === 9 ? (
          <Button className="btn" onClick={sendRestart} variant="primary">
            Restart
          </Button>
        ) : null}{' '}
        {winner ? (
          <span>We have a winner: {player}</span>
        ) : turnNumber === 9 ? (
          <span>It's a tie!</span>
        ) : null}
      </p>
      <div className="row-box">
        <Box index={0} turn={sendTurn} value={game[0]} />
        <Box index={1} turn={sendTurn} value={game[1]} />
        <Box index={2} turn={sendTurn} value={game[2]} />
      </div>
      <div className="row-box">
        <Box index={3} turn={sendTurn} value={game[3]} />
        <Box index={4} turn={sendTurn} value={game[4]} />
        <Box index={5} turn={sendTurn} value={game[5]} />
      </div>
      <div className="row-box">
        <Box index={6} turn={sendTurn} value={game[6]} />
        <Box index={7} turn={sendTurn} value={game[7]} />
        <Box index={8} turn={sendTurn} value={game[8]} />
      </div>
    </div>
  );
};

export default Home;
