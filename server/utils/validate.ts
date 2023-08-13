import { Type } from "arktype";
import { H3Event } from "h3";

export const validate = <V>(key: string, validator: Type<V>, data: unknown) => {
  const { data: validated, problems } = validator(data);
  if (problems) throw createError(`${key}: ${problems}`);
  return validated;
};

type EventValidator<
  Q,
  P,
  B,
  TQ extends Type<Q> = Type<Q>,
  TP extends Type<P> = Type<P>,
  TB extends Type<B> = Type<B>,
> = Partial<{ query: TQ; param: TP; body: TB }>;

async function _validateEvent<
  K extends keyof EventValidator<Q, P, B>,
  EventValidatorT extends EventValidator<Q, P, B>,
  Q,
  P,
  B,
>(
  key: K,
  validator: EventValidatorT,
  data: () => Promise<unknown>,
): Promise<
  EventValidatorT[K] extends Type ? EventValidatorT[K]["infer"] : undefined
>;

async function _validateEvent<
  K extends keyof EventValidator<Q, P, B>,
  EventValidatorT extends EventValidator<Q, P, B>,
  Q,
  P,
  B,
>(key: K, validator: EventValidatorT, data: () => Promise<unknown>) {
  const v = validator[key];
  if (!v) return undefined;
  return validate(
    key,
    v as Type<NonNullable<EventValidatorT[K]>["infer"]>,
    await data(),
  );
}

export const validateEvent = async <
  EventValidatorT extends EventValidator<Q, P, B>,
  Q,
  P,
  B,
>(
  validator: EventValidatorT,
  event: H3Event,
) => {
  return {
    query: await _validateEvent("query", validator, async () =>
      getQuery(event),
    ),
    param: await _validateEvent(
      "param",
      validator,
      async () => event.context.params,
    ),
    body: await _validateEvent(
      "body",
      validator,
      async () => await readBody(event),
    ),
  };
};
