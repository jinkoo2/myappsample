const fs = require("fs");
const path = require("path");

function prog_path() {
  return path.join(path.join(__dirname, "dcmtk"), "dcmdjpeg.exe");
}

function dcmdjpeg(dcm_file, decom_file) {
  const prog = prog_path();
  const cmd = `${prog} "${dcm_file}" "${decom_file}"`;

  msg(`cmd - ${cmd}`);

  require("child_process").execSync(cmd);
}

function send(type, payload) {
  process.send({
    type,
    payload,
  });
}
function msg(msg) {
  send("msg", { msg: msg });
  console.log(msg);
}

function err(msg) {
  send("error", { msg: msg });
  console.error(msg);
}

exports.decompress = ({ input_dir, output_dir }) => {
  console.log("start...");
  msg(`input_dir = ${input_dir}`);
  msg(`output_dir = ${output_dir}`);

  // check if the program exists
  const prog = prog_path();
  msg(`program executale - ${prog}`);
  if (!fs.existsSync(prog)) {
    err(`program executable not found - ${prog}`);
    return;
  }

  // get all objects in the folder
  const objects = fs.readdirSync(input_dir, { withFileTypes: true });

  // only files
  const filenames = objects
    .filter((obj) => obj.isFile())
    .map((obj) => obj.name);

  if (!fs.existsSync(output_dir)) {
    try {
      fs.mkdirSync(output_dir);
      msg(`created output folder - ${output_dir}`);
    } catch (err) {
      err(`failed creating output folder - ${output_dir}`);
      return;
    }
  }

  filenames.forEach((filename, index) => {
    const src = path.join(input_dir, filename);
    const dst = path.join(output_dir, filename);

    // send msg

    try {
      dcmdjpeg(src, dst);

      const item_result = {
        filename,
        index,
        num_of_files: filenames.length,
        result: "SUCCESS",
      };

      send("item_result", item_result);
    } catch (err) {
      console.log(err);

      const item_result = {
        filename,
        index,
        num_of_files: filenames.length,
        result: "FAILED",
      };

      send("item_result", item_result);
    }
  });
};
