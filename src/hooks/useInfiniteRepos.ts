import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Repo } from "../types/github";
import { searchRepos } from "../api/github";

type Status = "idle" | "loading" | "error";
type LoadMode = "replace" | "append";

type UseInfiniteReposParams = {
  searchQuery: string;
  perPage: number;
  sort?: "stars" | "forks" | "updated";
  order?: "desc" | "asc";
};

type State = {
  repos: Repo[];
  page: number;
  hasNext: boolean;
  status: Status;
  errorMsg: string | null;
  isLoadingMore: boolean;
  lastLoadMode: LoadMode | null;
};

const initialState: State = {
  repos: [],
  page: 1,
  hasNext: true,
  status: "idle",
  errorMsg: null,
  isLoadingMore: false,
  lastLoadMode: null,
};

type Action =
  | { type: "RESET" }
  | { type: "LOAD_START"; mode: LoadMode }
  | {
      type: "LOAD_SUCCESS";
      mode: LoadMode;
      repos: Repo[];
      loadedPage: number;
      totalCount: number;
    }
  | { type: "LOAD_ERROR"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initialState;

    case "LOAD_START":
      return {
        ...state,
        status: "loading",
        errorMsg: null,
        isLoadingMore: action.mode === "append",
        lastLoadMode: action.mode,
      };

    case "LOAD_SUCCESS": {
      const nextRepos =
        action.mode === "replace"
          ? action.repos
          : [...state.repos, ...action.repos];

      const hasNext = nextRepos.length < action.totalCount;

      return {
        ...state,
        repos: nextRepos,
        hasNext,
        page: action.loadedPage + 1,
        status: "idle",
        errorMsg: null,
        isLoadingMore: false,
      };
    }

    case "LOAD_ERROR":
      return {
        ...state,
        status: "error",
        errorMsg: action.message,
        isLoadingMore: false,
      };

    default:
      return state;
  }
}

// ------------------------------------------------------------

export function useInfiniteRepos({
  searchQuery,
  perPage,
  sort,
  order,
}: UseInfiniteReposParams) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const queryKeyRef = useRef(0);

  const statusRef = useRef<Status>(state.status);
  const hasNextRef = useRef<boolean>(state.hasNext);

  useEffect(() => {
    statusRef.current = state.status;
    hasNextRef.current = state.hasNext;
  }, [state.status, state.hasNext]);

  const loadPage = useCallback(
    async (targetPage: number, mode: LoadMode) => {
      if (statusRef.current === "loading") return;
      if (!hasNextRef.current && mode === "append") return;

      const trimmedQuery = searchQuery.trim();

      if (!trimmedQuery) {
        dispatch({ type: "RESET" });
        return;
      }

      const requestKey = queryKeyRef.current;

      dispatch({ type: "LOAD_START", mode });

      const result = await searchRepos({
        searchQuery: trimmedQuery,
        page: targetPage,
        perPage,
        sort,
        order,
      });

      if (queryKeyRef.current !== requestKey) return;

      if (!result.ok) {
        dispatch({ type: "LOAD_ERROR", message: result.error.message });
        return;
      }

      dispatch({
        type: "LOAD_SUCCESS",
        mode,
        repos: result.data.repos,
        loadedPage: targetPage,
        totalCount: result.data.totalCount,
      });
    },
    [searchQuery, perPage, sort, order],
  );

  useEffect(() => {
    queryKeyRef.current += 1;
    dispatch({ type: "RESET" });

    if (!searchQuery.trim()) return;

    void loadPage(1, "replace");
  }, [searchQuery, perPage, sort, order, loadPage]);

  const loadMore = useCallback(() => {
    void loadPage(state.page, "append");
  }, [loadPage, state.page]);

  const retry = useCallback(() => {
    if (state.lastLoadMode === "append") {
      void loadPage(state.page, "append");
      return;
    }

    void loadPage(1, "replace");
  }, [loadPage, state.lastLoadMode, state.page]);

  return {
    repos: state.repos,
    status: state.status,
    errorMsg: state.errorMsg,
    hasNext: state.hasNext,
    isLoadingMore: state.isLoadingMore,
    loadMore,
    retry,
  };
}
