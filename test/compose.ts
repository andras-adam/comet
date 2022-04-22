/* eslint-disable max-len */

type UnaryFn<A = any, R = any> = (a: A) => R;
type Argument<F> = F extends UnaryFn<infer A, unknown> ? A : never;
type Return<F> = F extends UnaryFn<unknown, infer R> ? R : never;
type LastInArray<T> = T extends [...unknown[], infer R] ? R : never;

// Return F1 if its return type is assignable to F2's argument type, otherwise
// return the required function type for the error message.
type ValidCompose<Prev, Curr> = Return<Prev> extends Argument<Curr> ? Curr : UnaryFn<Return<Prev>, Return<Curr>>;

// For each function, validate the composition with its successor.
type ValidPipe<FS> = FS extends [infer F1, infer F2, ...infer Rest]
  ? [ValidCompose<F1, F2>, ...ValidPipe<[F2, ...Rest]>]
  : [];

type ValidPipeX<FS> = FS extends [infer F1, infer F2, ...infer Rest]
  ? [F1, ...ValidPipe<[F1, F2, ...Rest]>]
  : FS;

// type ReverseValidCompose<F1, F2> = Return<F1> extends Argument<F2> ? F2 : (arg: Return<F1>) => Return<F2>;

// type ReverseValidPipe<FS> = FS extends [...infer Rest, infer F1, infer F2] ? [...ReverseValidPipe<[...Rest, F1]>, ReverseValidCompose<F1, F2>] : FS;

type Test = ValidPipe<[(s: string) => boolean, (n: number) => number]>;

type TestX = ValidPipeX<[(s: string) => boolean, (n: number) => number]>;

const one = (s: string) => !!s;
const two = (b: boolean) => +b;
const three = (n: number) => n ** n;

type TestY = ValidPipeX<[typeof one, typeof three]>;

declare function useComet<FS extends UnaryFn[]>(
  options: {
    method: string,
    path: string,
    middlewares: [...ValidPipeX<FS>],
  },
  // handler: (x: Return<LastInArray<FS>>) => void,
): unknown;

useComet({
  method: 'post',
  path: '/api/users/:userId',
  middlewares: [one, three],
}/* , event => {
  console.log(event);
} */);

//
//
//
//
//

// type Chain<In, Out, Tmp1 = any, Tmp2 = any> = [] | [(arg: In) => Out] | [(arg: In) => Tmp1, (i: Tmp1) => Tmp2, ...Chain<Tmp2, Out>];

// type Lookup<T, K extends keyof any, Else = never> = K extends keyof T ? T[K] : Else
// type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
// type Func1 = (arg: any) => any;
// type ArgType<F, Else = never> = F extends (arg: infer A) => any ? A : Else;
// type AsChain<F extends [Func1, ...Func1[]], G extends Func1[] = Tail<F>> =
//   { [K in keyof F]: (arg: ArgType<F[K]>) => ArgType<Lookup<G, K, any>, any> };
//
// type Last<T extends any[]> = T extends [...infer F, infer L] ? L : never;
//
// type LaxReturnType<F> = F extends (...args: any) => infer R ? R : never;
//
// declare function flow<F extends [(arg: any) => any, ...Array<(arg: any) => any>]>(
//   ...f: F & AsChain<F>
// ): (arg: ArgType<F[0]>) => LaxReturnType<Last<F>>;
//
// const stringToString = flow(
//   (x: string) => x.length,
//   (y: number) => y + "!"
// ); // okay
// const str = stringToString("hey"); // it's a string
// str.toUpperCase();
//
// const tooFewParams = flow(); // error
//
// const badChain = flow(
//   (x: number) => "string",
//   (y: string) => false,
//   (z: number) => "oops"
// ); // error, boolean not assignable to number
