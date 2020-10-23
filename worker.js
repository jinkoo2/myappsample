function send(type, payload) {
  process.send({
    type,
    payload,
  });
}

const args = process.argv.slice(2);
send("msg", "worker thread starting");

if (args.length !== 2) {
  send("error", "I am expecting two arguments - " + JSON.stringify(args));
  return;
}

const [input_dir, output_dir] = args;

// NEED TO VERIFY THE INPUT ARGUMENTS

const dicom_decompressor = require("./dicom_decompressor");

dicom_decompressor.decompress({
  input_dir: input_dir,
  output_dir: output_dir,
});
