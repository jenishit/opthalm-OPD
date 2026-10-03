[browser] ./app/globals.css:2:1
Error: Parsing CSS source code failed
  1 | /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
> 2 | @layer properties;
    | ^
  3 | @layer theme, base, components, utilities;
  4 | @layer theme {
  5 |   :root, :host {

Invalid dangling combinator in selector

Generated code of PostCSS transform of file content of app/globals.css:
./app/globals.css:2:1
  1 | /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
> 2 | @layer properties;
    | ^
  3 | @layer theme, base, components, utilities;
  4 | @layer theme {
  5 |   :root, :host {

Import trace:
  Client Component Browser:
    ./app/globals.css [Client Component Browser]
    ./app/layout.tsx [Server Component] 

