import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Authorized,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';
import { Todo, TodoModel } from '../entities/Todo';
import { TodoInput } from './types/todo-input';
import { User, UserModel } from '../entities/User';
import { MyContext } from 'src/types/myContext';

@Resolver((_of) => Todo)
export class TodoResolver {
  @Query((_returns) => Todo, { nullable: false })
  async returnSingleTodo(@Arg('id') id: string) {
    return await TodoModel.findById({ _id: id });
  }

  @Query(() => [Todo])
  async returnAllTodo() {
    return await TodoModel.find();
  }

  @Authorized()
  @Mutation(() => Todo)
  async createTodo(
    @Arg('data')
    { title }: TodoInput,
    @Ctx() ctx: MyContext
  ): Promise<Todo> {
    const todo = (
      await TodoModel.create({
        title,
        completed: false,
        user_id: ctx.req.session!.userId,
      })
    ).save();
    return todo;
  }

  @Authorized()
  @Mutation(() => Todo)
  async updateTodo(
    @Arg('id') id: string,
    @Arg('data')
    { title, completed }: TodoInput
  ): Promise<Todo> {
    const todo = (await TodoModel.findByIdAndUpdate(
      id,
      {
        title,
        completed,
      },
      { new: true }
    ))!.save();

    return todo;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteTodo(@Arg('id') id: string) {
    await TodoModel.deleteOne({ id });
    return true;
  }

  // Extract user field on Todo
  @FieldResolver((_type) => User)
  async user(@Root() todo: Todo): Promise<User> {
    return (await UserModel.findById(todo._doc.user_id))!;
  }
}
