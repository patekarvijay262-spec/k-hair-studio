# K Hair Studio website

Website for K Hair Studio, a unisex family salon in Powai, Mumbai. It's a static site with no build step and no backend.

## Run it on your computer

You need [Node.js](https://nodejs.org). From this folder, run:

```bash
node serve.js
```

Then open http://localhost:4174

## Host it

Upload the contents of the `site` folder to any static host. All paths are relative, so it also works from a subfolder.

## What to edit

| To change | Edit |
|---|---|
| Text and photos | `site/index.html` |
| WhatsApp number, service list, public prices | top of `site/assets/main.js` |
| Colours, sizes, layout | `site/assets/styles.css` |

The WhatsApp number also appears as `tel:` links in `site/index.html`. Update those if it changes.

## Good to know

- Booking and feedback open WhatsApp with the message written out, and the customer presses send.
- Only entry prices are public. Keep other prices out of these files, because anyone can read a website's source.
