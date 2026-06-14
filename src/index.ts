export default {
  async fetch(request: Request) {
    return new Response("Ekonos Worker is live.", {
      headers: {"Content-Type": "text/plain; charset=utf-8"},
    });
  },
};
