const fs=require("fs"); const dir="convex";
function w(f,l) { fs.writeFileSync(dir+"/"+f,l.join("\\n")); }
w("test2.txt",["test"]);
console.log("write-files.js ready");
