import { useState } from "react";

const Counter = () => {
  const [counter, setCounter] = useState<number>(0);
  return (
    <div
      className="w-full border border-rose-800 px-2 py-1 text-center cursor-pointer"
      onClick={() => setCounter(counter + 1)}
    >
      {counter}
    </div>
  );
};

export default Counter;
