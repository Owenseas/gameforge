export const G = {
  seedream: {
    name: "Seedream (豆包)",
    color: "#00E5FF",
    icon: "seedling",
    defUrl: "https://ark.cn-beijing.volces.com/api/v3/images/generations",
    docs: "https://www.volcengine.com/docs/82379/1541523",
    models: [
      {
        id: "doubao-seedream-5-0-260128",
        label: "Seedream 5.0 lite",
        fam: "5.0",
        badge: "推荐",
      },
      { id: "doubao-seedream-4-5-251128", label: "Seedream 4.5", fam: "4.5" },
      {
        id: "doubao-seedream-4-0-250828",
        label: "Seedream 4.0",
        fam: "4.0",
        badge: "fast",
      },
    ],
    caps: {
      "5.0": {
        res: ["2K", "3K"],
        fmts: ["png", "jpeg"],
        opt: ["standard"],
        web: true,
      },
      4.5: { res: ["2K", "4K"], fmts: ["jpeg"], opt: ["standard"], web: false },
      "4.0": {
        res: ["1K", "2K", "4K"],
        fmts: ["jpeg"],
        opt: ["standard", "fast"],
        web: false,
      },
    },
    sz: {
      "5.0": {
        "2K": {
          "1:1": "2048x2048",
          "3:4": "1728x2304",
          "4:3": "2304x1728",
          "16:9": "2848x1600",
          "9:16": "1600x2848",
          "3:2": "2496x1664",
          "2:3": "1664x2496",
          "21:9": "3136x1344",
        },
        "3K": {
          "1:1": "3072x3072",
          "3:4": "2592x3456",
          "4:3": "3456x2592",
          "16:9": "4096x2304",
          "9:16": "2304x4096",
        },
      },
      4.5: {
        "2K": {
          "1:1": "2048x2048",
          "3:4": "1728x2304",
          "4:3": "2304x1728",
          "16:9": "2848x1600",
          "9:16": "1600x2848",
        },
        "4K": { "1:1": "4096x4096", "3:4": "3520x4704", "4:3": "4704x3520" },
      },
      "4.0": {
        "1K": {
          "1:1": "1024x1024",
          "3:4": "864x1152",
          "4:3": "1152x864",
          "16:9": "1312x736",
          "9:16": "736x1312",
        },
        "2K": {
          "1:1": "2048x2048",
          "3:4": "1728x2304",
          "4:3": "2304x1728",
          "16:9": "2848x1600",
          "9:16": "1600x2848",
        },
        "4K": { "1:1": "4096x4096", "3:4": "3520x4704", "4:3": "4704x3520" },
      },
    },
    defP: {
      model: "doubao-seedream-5-0-260128",
      size: "2K",
      ar: "auto",
      fmt: "png",
      rfmt: "url",
      wm: false,
      opt: "standard",
      seq: "disabled",
      mx: 1,
      strm: false,
      ws: false,
    },
    build(pr, neg, w, h, p) {
      const fm =
        {
          "doubao-seedream-5-0-260128": "5.0",
          "doubao-seedream-4-5-251128": "4.5",
          "doubao-seedream-4-0-250828": "4.0",
        }[p.model] || "5.0";
      const b = {
        model: p.model,
        prompt: neg ? pr + "。注意避免：" + neg : pr,
        watermark: p.wm,
        response_format: p.rfmt,
      };
      if (p.size.includes("x")) {
        b.size = p.size;
      } else {
        const pre = this.sz[fm]?.[p.size] || {};
        if (p.ar && p.ar !== "auto" && pre[p.ar]) {
          b.size = pre[p.ar];
        } else {
          const r = w / h;
          let best = "1:1",
            bd = 9;
          Object.keys(pre).forEach((a) => {
            const [x, y] = a.split(":").map(Number);
            const d = Math.abs(x / y - r);
            if (d < bd) {
              bd = d;
              best = a;
            }
          });
          b.size = pre[best] || p.size;
        }
      }
      if (fm === "5.0") b.output_format = p.fmt;
      if (p.opt !== "standard" && fm === "4.0")
        b.optimize_prompt_options = { mode: p.opt };
      b.sequential_image_generation = p.seq;
      if (p.seq === "auto" && p.mx > 1)
        b.sequential_image_generation_options = {
          max_images: Math.min(p.mx, 15),
        };
      b.stream = p.strm;
      if (p.ws && fm === "5.0") b.tools = [{ type: "web_search" }];
      return b;
    },
    parse(d) {
      if (d.error)
        return { ok: false, err: `[${d.error.code}] ${d.error.message}` };
      const i = d.data || [];
      if (!i.length) return { ok: false, err: "无图片" };
      return { ok: true, url: i[0].url, sz: i[0].size, usage: d.usage };
    },
    auth: (k) => ({
      Authorization: "Bearer " + k,
      "Content-Type": "application/json",
    }),
  },

  nanobanana: {
    name: "NanoBanana",
    color: "#FFD60A",
    icon: "banana",
    defUrl: "",
    docs: "",
    models: [{ id: "default", label: "Default" }],
    caps: {},
    sz: {},
    defP: { model: "default", steps: 30, gd: 7.5, num: 1 },
    build(pr, neg, w, h, p) {
      return {
        prompt: pr,
        negative_prompt: neg,
        width: w,
        height: h,
        model: p.model,
        steps: p.steps,
        guidance_scale: p.gd,
        num_images: p.num,
      };
    },
    parse(d) {
      const u =
        d.images?.[0]?.url || d.output?.image_url || d.url || d.data?.[0]?.url;
      return u ? { ok: true, url: u } : { ok: false, err: "parse fail" };
    },
    auth: (k) => ({
      Authorization: "Bearer " + k,
      "Content-Type": "application/json",
    }),
  },

  midjourney: {
    name: "Midjourney",
    color: "#5865F2",
    icon: "palette",
    defUrl: "",
    docs: "",
    models: [{ id: "v6", label: "V6" }],
    caps: {},
    sz: {},
    defP: { model: "v6", sty: 250, ar: "auto" },
    build(pr, neg, w, h, p) {
      let m = pr;
      if (neg) m += " --no " + neg;
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      if (p.ar !== "auto") {
        m += " --ar " + p.ar;
      } else {
        const d = gcd(w, h);
        m += ` --ar ${w / d}:${h / d}`;
      }
      m += " --s " + p.sty;
      return { prompt: m, model: p.model };
    },
    parse(d) {
      const u = d.image_url || d.uri;
      return u ? { ok: true, url: u } : { ok: false, err: "async/parse fail" };
    },
    auth: (k) => ({
      Authorization: "Bearer " + k,
      "Content-Type": "application/json",
    }),
  },

  custom: {
    name: "自定义API",
    color: "#86868B",
    icon: "plug",
    defUrl: "",
    docs: "",
    models: [{ id: "default", label: "Default" }],
    caps: {},
    sz: {},
    defP: { model: "default" },
    build(pr, neg, w, h) {
      return { prompt: pr, negative_prompt: neg, width: w, height: h };
    },
    parse(d) {
      const u = d.url || d.image_url || d.images?.[0]?.url;
      return u
        ? { ok: true, url: u }
        : { ok: false, err: "check response format" };
    },
    auth: (k) => ({
      Authorization: "Bearer " + k,
      "Content-Type": "application/json",
    }),
  },
};
