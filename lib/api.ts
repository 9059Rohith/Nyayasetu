import type { z } from "zod";

export async function parseRouteInput<T>(request: Request, schema: z.ZodType<T>, message: string): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  try {
    const data = schema.safeParse(await request.json());
    if (!data.success) return { ok: false, response: Response.json({ error: message }, { status: 400 }) };
    return { ok: true, data: data.data };
  } catch {
    return { ok: false, response: Response.json({ error: message }, { status: 400 }) };
  }
}
