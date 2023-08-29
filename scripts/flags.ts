import { fetch, ProxyAgent, setGlobalDispatcher } from "undici";

if (process.env.http_proxy) {
  setGlobalDispatcher(new ProxyAgent(process.env.http_proxy));
}

async function main() {
  let text = await fetch(
    // "https://raw.gitmirror.com/evanw/esbuild/main/pkg/cli/cli_impl.go"
    "https://github.com/evanw/esbuild/raw/main/pkg/cli/cli_impl.go"
  ).then(r => r.text());
  let start = text.indexOf("func parseOptionsImpl(");
  let working = true;
  text = text.slice(start);
  text.replace(/(?:^\t\tcase (.+):|^\t\tdefault:)\n([^]+?)(?=^\t\t[cd])/gm, (_, line, content) => {
    if (!line) working = false;
    if (working) parse_line(line, content);
    return "";
  });
}

function extract_first_string_literal(line: string) {
  let start = line.indexOf('"') + 1;
  let end = line.indexOf('"', start);
  return line.slice(start, end);
}

function parse_line(line: string, content: string) {
  if (line[0] === "!") return;
  const flag = extract_first_string_literal(line);
  if (flag[0] !== "-") return;

  if (line.startsWith("isBoolFlag(")) {
    console.log(`["${flag.slice(2)}", boolean],`);
    return;
  }

  if (line.startsWith("strings.HasPrefix(")) {
    const real_flag = flag.slice(0, flag.length - 1);
    const sign = flag[flag.length - 1];
    if (sign === "=") {
      if (content.includes("splitWithEmptyCheck")) {
        console.log(`["${real_flag.slice(2)}", array],`);
      } else if (content.includes("strconv.Atoi")) {
        console.log(`["${real_flag.slice(2)}", string, { transform: parseInt }],`);
      } else {
        console.log(`["${real_flag.slice(2)}", string],`);
      }
    } else if (sign === ":") {
      if (content.includes("equals := strings.IndexByte")) {
        console.log(`["${real_flag.slice(2)}", dict],`);
      } else {
        console.log(`["${real_flag.slice(2)}", list],`);
      }
    } else {
      throw new Error(`unknown flag ${flag}`);
    }
    return;
  }

  console.log(`["${flag.slice(2)}", truthy],`);
}

main().catch(console.error);
