"use client";

import { createContext, useContext } from "react";

/* `ready` flips to true when the preloader starts lifting, so the hero can play its entrance. */
export const IntroContext = createContext<{ ready: boolean }>({ ready: true });
export const useIntro = () => useContext(IntroContext);
