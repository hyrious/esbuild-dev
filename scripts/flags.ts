import { get } from "https";

function fetch(url: string) {
  return new Promise<string>((resolve, reject) => {
    get(url, res => {
      const chunks: Buffer[] = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    }).on("error", reject);
  });
}

async function main() {
  let text = await fetch(
    // "https://raw.fastgit.org/evanw/esbuild/master/pkg/cli/cli_impl.go"
    "https://raw.githubusercontent.com/evanw/esbuild/master/pkg/cli/cli_impl.go"
  );
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
