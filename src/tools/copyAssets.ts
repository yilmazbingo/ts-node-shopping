import * as shell from "shelljs";

// Copy all the view templates
shell.cp("-R", "src/views", "build/");
shell.cp("-R", "src/images", "build/");
shell.cp("-R", "src/public", "build/");
shell.cp("-R", "src/logs", "build/");

// this copies the folder that inside public
// shell.cp("public", "build/");
