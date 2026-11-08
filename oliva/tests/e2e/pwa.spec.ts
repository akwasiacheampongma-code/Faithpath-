import { test, expect } from "@playwright/test";
test("das installierbare Offlinepaket liefert Manifest, vollständige Icons und Inhaltsrechte",async({page,request})=>{
  await page.goto("/garten");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href","/manifest.webmanifest");
  const result=await request.get("/manifest.webmanifest");expect(result.ok()).toBe(true);
  const manifest=await result.json();expect(manifest.display).toBe("standalone");expect(manifest.start_url).toBe("/");expect(manifest.scope).toBe("/");
  for(const icon of [...manifest.icons,{src:"/apple-touch-icon.png",sizes:"180x180"}]) {
    const data=await request.get(icon.src);expect(data.ok()).toBe(true);
    const body=await data.body(),width=Number(icon.sizes.split("x")[0]);
    expect(body.subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a");expect(body.readUInt32BE(16)).toBe(width);expect(body.readUInt32BE(20)).toBe(width);
  }
  for(const name of ["MIT.txt","DMSans-OFL.txt","CormorantGaramond-OFL.txt","THIRD_PARTY_NOTICES.txt"]) expect((await request.get(`/licenses/${name}`)).ok()).toBe(true);
  await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.isSecureContext)).toBe(true);
});
