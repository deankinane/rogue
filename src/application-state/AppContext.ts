import { createContext } from "react";
import AppState from "./AppState";

export const appContext = createContext<AppState>({});
