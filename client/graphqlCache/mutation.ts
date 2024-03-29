import {
  QueryInput,
  Cache,
  DataFields,
  ResolveInfo,
  Variables,
} from '@urql/exchange-graphcache';
import {
  LogoutMutation,
  FetchMeQuery,
  FetchMeDocument,
  LoginMutation,
  RegisterMutation,
  // DeleteTodoMutation,
  FetchTodosQuery,
  FetchTodosDocument,
  DeleteTodoMutationVariables,
  CreateTodoMutation,
} from '../generated/graphql';

function updateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  cb: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => cb(result, data as any) as any);
}

interface MutationProps {
  [K: string]: (
    _result: DataFields,
    _args: Variables,
    _cache: Cache,
    _info: ResolveInfo
  ) => void;
}

export const Mutation: MutationProps = {
  logoutUser: (_result, _args, _cache, _info) => {
    updateQuery<LogoutMutation, FetchMeQuery>(
      _cache,
      { query: FetchMeDocument },
      _result,
      () => ({ me: null })
    );
  },
  loginUser: (_result, _args, _cache, _info) => {
    updateQuery<LoginMutation, FetchMeQuery>(
      _cache,
      { query: FetchMeDocument },
      _result,
      (result, query) => {
        if (result.loginUser) {
          return {
            me: result.loginUser,
          };
        }
        return query;
      }
    );
  },
  registerUser: (_result, _args, _cache, _info) => {
    updateQuery<RegisterMutation, FetchMeQuery>(
      _cache,
      { query: FetchMeDocument },
      _result,
      (result, query) => {
        if (result.registerUser) {
          return {
            me: result.registerUser,
          };
        }
        return query;
      }
    );
  },
  createTodo: (_result, _args, _cache, _info) => {
    updateQuery<CreateTodoMutation, FetchTodosQuery>(
      _cache,
      { query: FetchTodosDocument },
      _result,
      (result, query) => {
        query.returnAllTodo.push(result.createTodo);
        return query;
      }
    );
  },
  deleteTodo: (_result, _args, _cache, _info) => {
    _cache.invalidate({
      __typename: 'Todo',
      id: (_args as DeleteTodoMutationVariables).id,
    });
    // updateQuery<DeleteTodoMutation, FetchTodosQuery>(
    //   _cache,
    //   { query: FetchTodosDocument },
    //   _result,
    //   (result, query) => {
    //     if (result.deleteTodo) {
    //       query.returnAllTodo = query.returnAllTodo.filter(
    //         (todo) => todo.id !== _args.id
    //       );

    //       console.log(query.returnAllTodo);

    //       return query;
    //     }
    //     return query;
    //   }
    // );
  },
};
