import { useEffect, useState } from "react"
import "./Randomizer.css"

export function Randomizer({
  items = [],
  command = "reset",
}) {
  const [data, setData] = useState([...items])
  const [ended, setEnded] = useState(false)
  const [winner, setWinner] = useState("")
  const [cancelId, setCancelId] = useState(null)
  const [itemLength, setItemLength] = useState(5)

  useEffect(() => {
    if (command.toLowerCase() === "start") {
      setItemLength(data.length)
      setCancelId(
        setTimeout(() => {
          const length = data.length
          const selectedIndex = Math.floor(Math.random() * length)
          let _winner = data[selectedIndex]
          if (!_winner) {
            _winner = "No winner"
          }
          setWinner(_winner)
          setEnded(true)
          data.splice(selectedIndex, 1)
          setData(data)
        }, 1000)
      )
    } else if (command.toLowerCase() === "reset") {
      setEnded(false)
      setWinner("")
      setData([...items])
      if (cancelId) {
        clearTimeout(cancelId)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command])

  return (
    <>
      <div
        className={`text-loop-container font-bold text-2xl`}
        style={{
          color: "black",
        }}
      >
        <div
          className="shadow-top"
          style={{
            backgroundImage: `linear-gradient(to bottom, white, rgba(0,0,0,0))`,
          }}
        ></div>
        <div
          id="winner-list"
          className={`stop-text text-indigo-600 text-4xl ${!ended && "hide-scroller"}`}
        >
          <p>{winner}</p>
        </div>
        <div
          className="shadow-bottom"
          style={{
            backgroundImage: `linear-gradient(to top, white, rgba(0,0,0,0))`,
          }}
        ></div>
        <div
          className={`scroll-text ${
            winner !== "" ? "hide-scroller" : ""
          }  ${ended ? "hide-scroller" : ""}`}
          style={{
            animationName: "scrollingAnimation",
            animationDelay: "1s",
            animationIterationCount: "infinite",
            animationDuration: `${itemLength / (0.5)}s`,
            animationTimingFunction: "linear",
          }}
        >
          {data.map((item) => {
            return <p key={Math.random() * 100000}>{item}</p>
          })}
        </div>
      </div>
    </>
  )
}