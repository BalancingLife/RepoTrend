import { useState, useEffect } from "react";

function App() {
  const [text, setText] = useState("");
  const url =
    "https://api.github.com/search/repositories?q=typescript&sort=stars&order=desc&per_page=10";

  async function fetchRepo() {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      setText(JSON.stringify(data.items[0], null, 2));
    } catch (e) {
      console.error("HTTP 예외 에러입니다.", e);
    }
  }

  useEffect(() => {
    fetchRepo();
  }, []);

  return (
    <div>
      <div>{text}</div>
    </div>
  );
}

export default App;
