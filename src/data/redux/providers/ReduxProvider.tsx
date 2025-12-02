"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import { injectStore } from "@/data/services/apiConfig/apiClient";

injectStore(store);

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
