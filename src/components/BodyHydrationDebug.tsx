"use client";

import { useEffect } from "react";

export default function BodyHydrationDebug() {
  useEffect(() => {
    try {
      const serverAttrsRaw = document.body.getAttribute("data-server-attrs");
      const serverAttrs = serverAttrsRaw ? JSON.parse(serverAttrsRaw) : {};

      const attrs = Array.from(document.body.attributes).reduce<Record<string,string>>((acc, a) => {
        acc[a.name] = a.value;
        return acc;
      }, {});

      // Ignore known extension-injected attributes and the debug attribute itself
      const ignoredClientAttrs = new Set(["data-server-attrs", "cz-shortcut-listen"]);

      // Compare keys, but special-case htmlClass which belongs to <html>
      const added = Object.keys(attrs).filter(k => !(k in serverAttrs) && !ignoredClientAttrs.has(k));
      const removed = Object.keys(serverAttrs).filter(k => {
        if (k === 'htmlClass') return false; // handled separately
        return !(k in attrs);
      });
      const changed = Object.keys(serverAttrs).filter(k => {
        if (k === 'htmlClass') return false; // handled separately
        return k in attrs && String(serverAttrs[k]) !== String(attrs[k]);
      });

      // Compare htmlClass to document.documentElement.className
      const htmlClassChanges: Array<{key:string, server: any, client: any}> = [];
      if ('htmlClass' in serverAttrs) {
        const serverHtmlClass = String(serverAttrs.htmlClass || '');
        const clientHtmlClass = String(document.documentElement.className || '');
        if (serverHtmlClass !== clientHtmlClass) {
          htmlClassChanges.push({ key: 'htmlClass', server: serverHtmlClass, client: clientHtmlClass });
        }
      }

      console.group("BodyHydrationDebug — body attribute comparison");
      console.log("serverAttrs:", serverAttrs);
      console.log("clientAttrs:", attrs);
      if (added.length) console.warn("added on client:", added.map(k => ({[k]: attrs[k]})));
      if (removed.length) console.warn("removed on client:", removed.map(k => ({[k]: serverAttrs[k]})));
      if (changed.length) console.warn("changed:", changed.map(k => ({key:k, server: serverAttrs[k], client: attrs[k]})));
      if (htmlClassChanges.length) console.warn("htmlClass mismatch:", htmlClassChanges);
      if (!added.length && !removed.length && !changed.length && !htmlClassChanges.length) console.log("no differences detected");
      console.groupEnd();
    } catch (err) {
      console.error("BodyHydrationDebug error:", err);
    }
  }, []);

  return null;
}
