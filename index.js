const express = require("express");
const shortid = require("shortid");

const app = express();

app.use(express.json());

const links = {};

app.get("/", (req, res) => {
  res.send("BloggerOffers Server Running 🚀");
  });

  app.post("/shorten", (req, res) => {
    const { url } = req.body;

      if (!url) {
          return res.status(400).json({
                error: "No URL provided"
                    });
                      }

                        const cleanUrl = url.split("?")[0] + "?tag=bloggeroffe05-21";

                          const code = shortid.generate();

                            links[code] = {
                                original: cleanUrl,
                                    clicks: 0
                                      };

                                        res.json({
                                            shortUrl: `https://bloggeroffers.com/${code}`,
                                                original: cleanUrl
                                                  });
                                                  });

                                                  app.get("/:code", (req, res) => {
                                                    const code = req.params.code;

                                                      if (!links[code]) {
                                                          return res.status(404).send("Link not found");
                                                            }

                                                              links[code].clicks++;

                                                                res.redirect(links[code].original);
                                                                });

                                                                app.get("/stats/:code", (req, res) => {
                                                                  const code = req.params.code;

                                                                    if (!links[code]) {
                                                                        return res.status(404).json({
                                                                              error: "Not found"
                                                                                  });
                                                                                    }

                                                                                      res.json({
                                                                                          url: links[code].original,
                                                                                              clicks: links[code].clicks
                                                                                                });
                                                                                                });

                                                                                                app.listen(3000, () => {
                                                                                                  console.log("Server running on port 3000");
                                                                                                  });