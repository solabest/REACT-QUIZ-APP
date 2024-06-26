import { useEffect } from "react";
import "./App.css";
import Header from "./Header";
import Main1 from "./Main1";
import { useReducer } from "react";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import FinishScreen from "./components/FinishScreen";
import Footer from "./components/Footer";
import Timer from "./components/Timer";
const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  status: "loading...",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };

    case "newAnswer":
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finished":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };

    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
      };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };

    default:
      throw new Error("Action Unknown");
  }
}

function App() {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );
  useEffect(function () {
    fetch("http://localhost:3000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch(() => dispatch({ type: "dataFailed" }));
  }, []);
  return (
    <>
      <div className="app">
        <Header />

        <Main1>
          {status === "loading" && <Loader />}
          {status === "error" && <Error />}
          {status === "ready" && (
            <StartScreen dispatch={dispatch} numQuestions={numQuestions} />
          )}
          {status === "active" && (
            <>
              <Progress
                maxPossiblePoints={maxPossiblePoints}
                index={index}
                numQuestions={numQuestions}
                points={points}
                answer={answer}
              />
              <Question
                dispatch={dispatch}
                answer={answer}
                question={questions[index]}
              />

              <Footer>
                <Timer
                  dispatch={dispatch}
                  secondsRemaining={secondsRemaining}
                />
                <NextButton
                  index={index}
                  numQuestion={numQuestions}
                  answer={answer}
                  dispatch={dispatch}
                />
              </Footer>
            </>
          )}

          {status === "finished" && (
            <FinishScreen
              maxPossiblePoints={maxPossiblePoints}
              points={points}
              highscore={highscore}
              dispatch={dispatch}
            />
          )}
        </Main1>
      </div>
    </>
  );
}

export default App;
