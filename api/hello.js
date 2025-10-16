export default function handler(req, res) {
  return res.json({ hello: 'world', path: req.url });
}
