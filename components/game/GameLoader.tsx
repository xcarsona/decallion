"use client";
import dynamic from "next/dynamic";
import { Splash } from "./Splash";

/* The game is canvas, sound and browser storage, so it renders in the browser only. */
const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => <div className="screen" aria-busy="true" />,
});

export default function GameLoader() {
  return (
    <>
      <Game />
      <Splash />
    </>
  );
}
