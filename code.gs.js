/**
 * COPY KODE INI KE GOOGLE APPS SCRIPT (script.google.com)
 * 1. Buka Spreadsheet: 1XWldAYNP-GWzHLIqyE2J_YXwK4jehG2ZNX6ujlc1uaY
 * 2. Pilih menu Extensions > Apps Script
 * 3. Tempel kode ini di sana.
 * 4. Klik "Deploy" > "New Deployment".
 * 5. Pilih "Web App".
 * 6. Execute as: "Me".
 * 7. Who has access: "Anyone".
 * 8. Klik Deploy dan berikan izin akses.
 */

const SPREADSHEET_ID = "1XWldAYNP-GWzHLIqyE2J_YXwK4jehG2ZNX6ujlc1uaY";
const FOLDER_ID = "1dA8Rt2MEjCJt-ohaBccJcRDJdpFw-w9r";

function doGet(e) {
  return ContentService.createTextOutput("System Active").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("datasiswa");

    if (action === "login") {
      var rows = sheet.getDataRange().getDisplayValues();
      var inputNisn = data.nisn.toString().trim();
      var inputTgl = data.tgl_lahir.toString().trim();

      for (var i = 1; i < rows.length; i++) {
        // Cek NISN (kolom D / index 3) dan Tgl Lahir (kolom F / index 5)
        var rowNisn = rows[i][3] ? rows[i][3].toString().trim() : "";
        var rowTgl = rows[i][5] ? rows[i][5].toString().trim() : "";

        if (rowNisn === inputNisn && rowTgl === inputTgl) {
          var student = {
            no: rows[i][0],
            rombel: rows[i][1],
            nipd: rows[i][2],
            nisn: rows[i][3],
            nama: rows[i][4],
            tgl_lahir: rows[i][5],
            jurusan: rows[i][6],
            no_ijazah: rows[i][7],
            link_foto: rows[i][8],
            sekolah_asal: rows[i][9],
            rowNumber: i + 1
          };
          return response({ success: true, student: student });
        }
      }
      return response({ success: false, message: "Data tidak ditemukan (NISN atau Tgl Lahir salah)" });
    }

    if (action === "saveAll") {
      // 1. Update Data Tekstual
      sheet.getRange(data.rowNumber, 8).setValue(data.no_ijazah); // Kolom H
      sheet.getRange(data.rowNumber, 10).setValue(data.sekolah_asal); // Kolom J

      var finalUrl = data.link_foto || ""; 

      // 2. Jika ada file baru (Base64), upload ke Drive
      if (data.base64) {
        // Hapus file lama jika ada (Jangan biarkan error di sini menghentikan proses)
        if (finalUrl && finalUrl.length > 10) {
           try {
             var oldFileId = "";
             if (finalUrl.indexOf("id=") !== -1) {
               oldFileId = finalUrl.split("id=")[1].split("&")[0];
             } else if (finalUrl.indexOf("/d/") !== -1) {
               var parts = finalUrl.split("/d/");
               if (parts.length > 1) {
                 oldFileId = parts[1].split("/")[0];
               }
             }
             
             if (oldFileId) {
               // Gunakan try-catch khusus untuk penghapusan
               DriveApp.getFileById(oldFileId).setTrashed(true);
               console.log("File lama dibuang ke tempat sampah: " + oldFileId);
             }
           } catch(e) {
             // Log error tapi lanjutkan proses upload file baru
             console.log("Bypass: Gagal hapus file lama (mungkin sudah dihapus atau tidak ada akses): " + e);
           }
        }

        var folder = DriveApp.getFolderById(FOLDER_ID);
        var fileName = data.nisn + "_" + data.nama;
        
        var contentType = data.mimetype;
        var decodedData = Utilities.base64Decode(data.base64);
        var blob = Utilities.newBlob(decodedData, contentType, fileName);
        
        var file = folder.createFile(blob);
        
        try {
          // Setting sharing seringkali menyebabkan 'Access Denied' pada beberapa jenis akun
          // Kita coba, tapi jika gagal tetap lanjut
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) {
          console.log("Gagal set sharing: " + e);
        }
        
        finalUrl = file.getUrl();
        sheet.getRange(data.rowNumber, 9).setValue(finalUrl); // Kolom I
      }
      
      return response({ 
        success: true, 
        url: finalUrl, 
        message: "Data dan foto berhasil disimpan" 
      });
    }

    return response({ success: false, message: "Action not found" });
    
  } catch (error) {
    return response({ success: false, message: "Error: " + error.toString() });
  }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
