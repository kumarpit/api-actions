function createExampleMiddleware() {
  const middleware =
    ({ getState, dispatch }) =>
    (next) =>
    (action) => {
      console.log('Middleware triggered: ', action);
      next(action);
    };
  return middleware;
}

const example = createExampleMiddleware();

export default example;
