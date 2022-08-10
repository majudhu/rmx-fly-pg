import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import { db } from '~/utils/db.server';

import type { Joke } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";

export async function loader() {
  return json({ jokes: await db.joke.findMany() });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { id, ...data } = Object.fromEntries(formData) as unknown as Joke;
  switch (request.method) {
    case "DELETE":
      await db.joke.delete({ where: { id } });
      break;
    case "PUT":
      await db.joke.update({ where: { id }, data });
      break;
    case "POST":
      await db.joke.create({ data });
      break;
  }
  return redirect("/");
}

export default function Index() {
  const { jokes } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <Form method="post">
      <h1>Wanna hear a joke?</h1>
      {jokes.map(({ id, name, content, updatedAt, createdAt }) => (
        <div key={id} className="p-2 border">
          <p>id: {id}</p>
          <p>name: {name}</p>
          <p>content: {content}</p>
          <p>updatedAt: {updatedAt}</p>
          <p>createdAt: {createdAt}</p>
          <button
            type="button"
            name="id"
            value={id}
            onClick={(e) => submit(e.currentTarget, { method: "put" })}
          >
            update
          </button>
          <button
            type="button"
            onClick={() => submit({ id }, { method: "delete" })}
          >
            delete
          </button>
        </div>
      ))}

      <label>
        name: <input className="border" name="name" />
      </label>
      <label>
        content: <input className="border" name="content" />
      </label>
      <button type="submit">Make a joke!</button>
    </Form>
  );
}
