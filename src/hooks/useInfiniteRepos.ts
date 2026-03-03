import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Repo } from "../types/github";
import { searchRepos } from "../api/github";

type Status = "idle" | "loading" | "error";

type UseInfiniteReposParams = {
  keyword: string;
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

  totalCount: number;
  loadedCount: number;
};

type Action =
  | { type: "RESET" }
  | { type: "LOAD_START"; mode: "replace" | "append" }
  | {
      type: "LOAD_SUCCESS";
      mode: "replace" | "append";
      repos: Repo[];
      perPage: number;
      loadedPage: number;
      totalCount: number;
    }
  | { type: "LOAD_ERROR"; message: string };

const initialState: State = {
  repos: [],
  page: 1,
  hasNext: true,
  status: "idle",
  errorMsg: null,
  isLoadingMore: false,
  totalCount: 0,
  loadedCount: 0,
};

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
      };

    case "LOAD_SUCCESS": {
      const nextRepos =
        action.mode === "replace"
          ? action.repos
          : [...state.repos, ...action.repos];

      const loadedCount = nextRepos.length;
      const totalCount = action.totalCount;

      // totalCount 기반 hasNext
      const hasNext = loadedCount < totalCount;

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
export function useInfiniteRepos({
  keyword,
  perPage,
  sort,
  order,
}: UseInfiniteReposParams) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const queryKeyRef = useRef(0);

  // ✅ 최신 state를 ref로 보관해서 loadPage deps에서 state 제거
  const statusRef = useRef<Status>(state.status);
  const hasNextRef = useRef<boolean>(state.hasNext);

  useEffect(() => {
    statusRef.current = state.status;
    hasNextRef.current = state.hasNext;
  }, [state.status, state.hasNext]);

  const loadPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      // ✅ ref 기반 가드
      if (statusRef.current === "loading") return;
      if (!hasNextRef.current && mode === "append") return;

      const trimmed = keyword.trim();
      if (!trimmed) {
        dispatch({ type: "RESET" });
        return;
      }

      const myKey = queryKeyRef.current;

      dispatch({ type: "LOAD_START", mode });
      const result = await searchRepos({
        keyword: trimmed,
        page: targetPage,
        perPage,
        sort,
        order,
      });

      if (queryKeyRef.current !== myKey) return;

      if (!result.ok) {
        dispatch({ type: "LOAD_ERROR", message: result.error.message });
        return;
      }

      dispatch({
        type: "LOAD_SUCCESS",
        mode,
        repos: result.data.repos,
        perPage,
        loadedPage: targetPage,
        totalCount: result.data.totalCount,
      });
    },
    [keyword, perPage, sort, order], // ✅ state 의존성 제거됨
  );

  useEffect(() => {
    queryKeyRef.current += 1;
    dispatch({ type: "RESET" });

    // keyword 비었으면 여기서 끝내도 됨(불필요 호출 방지)
    if (!keyword.trim()) return;

    void loadPage(1, "replace");
  }, [keyword, sort, order, loadPage]);

  const loadMore = useCallback(() => {
    void loadPage(state.page, "append");
  }, [loadPage, state.page]);

  const retry = useCallback(() => {
    void loadPage(
      state.repos.length === 0 ? 1 : state.page,
      state.repos.length === 0 ? "replace" : "append",
    );
  }, [loadPage, state.page, state.repos.length]);

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
