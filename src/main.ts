import * as subCommands from "@/commands";
import { defineCommand } from "citty";
import { description, name, version } from "../package.json";

export default defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands,
  setup(_context) {},
});
