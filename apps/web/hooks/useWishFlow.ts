"use client";

import { useCallback, useReducer } from "react";
import type { WishResult } from "@cursed-wishes/shared";
import { createWish, WishApiError } from "../lib/api-client";

export type Screen =
  | "idle"
  | "rubbing"
  | "genie-revealed"
  | "input"
  | "loading"
  | "result"
  | "error";

interface WishFlowState {
  screen: Screen;
  rubProgress: number;
  wishText: string;
  result: WishResult | null;
  error: { code: string; message: string } | null;
  hasSeenGenie: boolean;
}

type WishFlowAction =
  | { type: "START_RUB" }
  | { type: "UPDATE_RUB"; progress: number }
  | { type: "GENIE_REVEALED" }
  | { type: "SHOW_INPUT" }
  | { type: "SET_WISH_TEXT"; text: string }
  | { type: "SUBMIT_WISH" }
  | { type: "WISH_SUCCESS"; result: WishResult }
  | { type: "WISH_ERROR"; code: string; message: string }
  | { type: "RETRY" }
  | { type: "RESET" };

const initialState: WishFlowState = {
  screen: "idle",
  rubProgress: 0,
  wishText: "",
  result: null,
  error: null,
  hasSeenGenie: false,
};

function reducer(state: WishFlowState, action: WishFlowAction): WishFlowState {
  switch (action.type) {
    case "START_RUB":
      return { ...state, screen: "rubbing", rubProgress: 0 };
    case "UPDATE_RUB":
      return { ...state, rubProgress: Math.min(1, action.progress) };
    case "GENIE_REVEALED":
      return { ...state, screen: "genie-revealed", hasSeenGenie: true };
    case "SHOW_INPUT":
      return { ...state, screen: "input", error: null };
    case "SET_WISH_TEXT":
      return { ...state, wishText: action.text };
    case "SUBMIT_WISH":
      return { ...state, screen: "loading", error: null };
    case "WISH_SUCCESS":
      return { ...state, screen: "result", result: action.result };
    case "WISH_ERROR":
      return {
        ...state,
        screen: "input",
        error: { code: action.code, message: action.message },
      };
    case "RETRY":
      return {
        ...state,
        screen: "input",
        wishText: "",
        result: null,
        error: null,
      };

    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useWishFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startRub = useCallback(() => dispatch({ type: "START_RUB" }), []);
  const updateRub = useCallback(
    (progress: number) => dispatch({ type: "UPDATE_RUB", progress }),
    [],
  );
  const revealGenie = useCallback(
    () => dispatch({ type: "GENIE_REVEALED" }),
    [],
  );
  const showInput = useCallback(() => dispatch({ type: "SHOW_INPUT" }), []);
  const setWishText = useCallback(
    (text: string) => dispatch({ type: "SET_WISH_TEXT", text }),
    [],
  );

  const submitWish = useCallback(async (wish: string) => {
    dispatch({ type: "SUBMIT_WISH" });
    try {
      const result = await createWish(wish);
      dispatch({ type: "WISH_SUCCESS", result });
    } catch (err) {
      if (err instanceof WishApiError) {
        dispatch({
          type: "WISH_ERROR",
          code: err.code,
          message: err.message,
        });
      } else {
        dispatch({
          type: "WISH_ERROR",
          code: "NETWORK_ERROR",
          message: "The genie's powers are disrupted. Try again.",
        });
      }
    }
  }, []);

  const retry = useCallback(() => dispatch({ type: "RETRY" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    startRub,
    updateRub,
    revealGenie,
    showInput,
    setWishText,
    submitWish,
    retry,
    reset,
  };
}
