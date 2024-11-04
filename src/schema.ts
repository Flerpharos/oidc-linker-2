import vine from '@vinejs/vine';

const linksSetSchema = vine.compile(
  vine
    .object({
      name: vine.string().minLength(1),
      description: vine.string(), // TODO deprecate this
      expiration: vine.number().min(-1), // valid UNIX timestamp by ms
    })
    .merge(
      vine.group([
        vine.group.if((data) => "id" in data && data.id != null, {
          id: vine.number().min(1).withoutDecimals(),
        }),
        vine.group.else({
          destination: vine.string().url(),
        }),
      ])
    )
);

export default {
  link: {
    set: linksSetSchema
  }
}