import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  comments: [],
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addComment: (state, action) => {
      state.comments.push(action.payload);
    },
    removeComment: (state, action) => {
      state.comments = state.comments.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addComment, removeComment } = commentSlice.actions;
export default commentSlice.reducer;
