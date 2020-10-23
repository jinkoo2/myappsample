const { dialog } = require("electron").remote;
const fs = require("fs");
const path = require("path");

let num_of_errors = 0;

/////////////////////
// helper functions
function _(selector) {
  return document.querySelector(selector);
}

function get_input_dir() {
  return _("#text_input_folder").value.trim();
}

function set_input_dir(dir) {
  _("#text_input_folder").value = dir;
}

function get_output_dir() {
  return _("#text_output_folder").value.trim();
}

function set_output_dir(dir) {
  _("#text_output_folder").value = dir;
}

/////////////////////////////////
// OnClick - Select Input Folder
_("#select_input_folder").addEventListener("click", (e) => {
  // dialog box
  dialog.showOpenDialog({ properties: ["openDirectory"] }).then((data) => {
    if (data.filePaths && data.filePaths.length === 1) {
      set_input_dir(data.filePaths[0]);

      // if the output folder is blank, set one.
      if (get_output_dir() === "") {
        set_output_dir(get_input_dir() + "\\decompressed");
      }
    }
  });
});

/////////////////////////////////
// OnClick - Select Output Folder
_("#select_output_folder").addEventListener("click", (e) => {
  // dialog box
  dialog.showOpenDialog({ properties: ["openDirectory"] }).then((data) => {
    if (data.filePaths && data.filePaths.length === 1) {
      set_output_dir(data.filePaths[0]);
    }
  });
});

function set_progressbar(percent) {
  _("#progressbar").style.width = percent.toString() + "%";
}

///////////////////
// OnItemResult
function onItemResult(item_result) {
  const { filename, index, num_of_files, result } = item_result;

  // if the last item
  const n = index + 1;

  const last_item = item_result.index === item_result.num_of_files - 1;
  if (last_item) {
    // set button label back to the orignal
    _("#start_decompress").innerHTML = "DECOMPRESS";
    // set progress
    _("#progress").innerHTML = `Finished ${n}/${num_of_files}`;

    // set the progress bar to 100 percent
    set_progressbar(100);
  } else {
    _("#progress").innerHTML = `Processing... ${n}/${num_of_files}`;

    // set the progress to 100 percent
    const percent = Math.floor(((1.0 * index) / num_of_files) * 100);
    console.log(percent);
    set_progressbar(percent);
  }

  // if success, return.
  if (result.toLowerCase() === "success") return;

  // append error to the list
  const li = document.createElement("li");
  li.classList.add("list-group-item");
  const text = document.createTextNode(filename);

  li.appendChild(text);
  _("#list").appendChild(li);

  // show failed case list
  _("#failed-cases").classList.remove("hide");

  // increase number of errors
  num_of_errors++;
  _("#num_of_errors").innerHTML = num_of_errors.toString();
}

/////////////////////////////////
// OnClick - Start Decompress
_("#start_decompress").addEventListener("click", (e) => {
  // check inputs
  if (get_input_dir() === "") {
    alert("Please select input folder!");
    return;
  }

  if (get_output_dir() === "") {
    alert("Please select output folder!");
    return;
  }

  if (!fs.existsSync(get_input_dir())) {
    alert("input directory not found!");
    return;
  }

  // disable the start button
  _("#start_decompress").innerHTML = "WAIT...";

  // clear the error list
  _("#list").innerHTML = "";

  // hide error section
  if (!_("#failed-cases").classList.contains("hide"))
    _("#failed-cases").classList.add("hide");

  num_of_errors = 0;
  _("#progress").innerHTML = "Progress... 0/0";
  set_progressbar(0); // progresbar to 0 percent
  _("#num_of_errors").innerHTML = num_of_errors.toString();

  ///////////////////////////////
  // for a worker thread
  var cp = require("child_process");
  const args = [get_input_dir(), get_output_dir()];
  var child = cp.fork(path.join(__dirname, "worker.js"), args);

  child.on("message", ({ type, payload }) => {
    if (type === "item_result") {
      console.log(payload);
      onItemResult(payload);
    } else if (type === "msg") {
      console.log(`worker:${payload.msg}`);
    } else if (type === "error") {
      console.log(`worker:${payload.msg}`);
    }
  });

  child.on("exit", (e) => {
    console.log("worker exited");
    console.log("exit code=", e);
  });
});
