const google = require("@googleapis/healthcare");
const { ErrorHandler } = require("../../config/error");
const path = require("path");
const healthcare = google.healthcare({
  version: "v1",
  auth: new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  }),
});
const router = require("express").Router();
const fs = require("fs");
const util = require("util");

//getdicomStores
router.get("/getdicomStores", async (req, res) => {
  const { DataSetID } = req.query;

  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  // const datasetId = "Patel_Hospital";
  const datasetId = DataSetID;

  //   const dicomStoreId = "Faisalabad";
  const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;
  const request = { parent };

  const dicomStores =
    await healthcare.projects.locations.datasets.dicomStores.list(request);
  res.send(JSON.stringify(dicomStores.data, null, 2));
});

//getdatasets
router.get("/getdatasets", async (req, res) => {
  const { DataSetID } = req.query;

  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  // const datasetId = "Patel_Hospital";
  const datasetId = DataSetID;

  const parent = `projects/${projectId}/locations/${cloudRegion}`;
  const request = { parent };

  const dataset = await healthcare.projects.locations.datasets.list(request);
  res.send(JSON.stringify(dataset.data, null, 2));
});

// dicomWebSearchStudies
router.get("/dicomWebSearchStudies", async (req, res) => {
  const { DataSetID, DicomStoreID } = req.query;
  // TODO(developer): uncomment these lines before running the sample
  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  // const datasetId = "Patel_Hospital";
  // const dicomStoreId = "Faisalabad";
  const datasetId = DataSetID;
  const dicomStoreId = DicomStoreID;
  const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
  const dicomWebPath = "studies";
  const request = { parent, dicomWebPath };

  const studies =
    await healthcare.projects.locations.datasets.dicomStores.searchForStudies(
      request,
      {
        params: { PatientName: "AKBAR ALI" },
        headers: { Accept: "application/dicom+json" },
      }
    );
  res.send(JSON.stringify(studies.data, null, 2));
});

//Get User Information
router.get("/userInfo", async (req, res, next) => {
  const { DataSetID, DicomStoreID, PatientName } = req.query;
  // Query Validation
  const missingFields = [];
  if (!DataSetID) missingFields.push("DataSetID");
  if (!DicomStoreID) missingFields.push("DicomStoreID");
  if (!PatientName) missingFields.push("PatientName");
  if (missingFields.length > 0)
    return new ErrorHandler(
      400,
      "Missing fields: " + missingFields.toString(),
      missingFields,
      res
    );
  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  const datasetId = DataSetID;
  const dicomStoreId = DicomStoreID;
  const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
  const dicomWebPath = "instances";
  const request = { parent, dicomWebPath };

  const studies =
    await healthcare.projects.locations.datasets.dicomStores.searchForStudies(
      request,
      {
        params: { PatientName: PatientName },
        headers: { Accept: "application/dicom+json" },
      }
    );
  const patientData = {
    studyUid: "",
    seriesUid: "",
    instances: [],
  };
  console.log(studies);
  if (studies.data === "") {
    return res.status(400).json({
      success: false,
      message: `Data Not Found against patient ${PatientName}`,
    });
  }
  studies.data.forEach((d) => {
    const serID = d["0020000E"].Value[0];
    const stdID = d["0020000D"].Value[0];
    patientData.seriesUid = serID;
    patientData.studyUid = stdID;
    patientData.instances.push(d["00080018"].Value[0]);
  });

  res.status(200).json({
    success: true,
    patientData,
  });
});

//dicomWebSearchForInstances
router.get("/dicomWebSearchForInstances", async (req, res) => {
  const { DataSetID, DicomStoreID, Value } = req.query;

  const missingFields = [];
  if (!DataSetID) missingFields.push("Dataset ID");
  if (!DicomStoreID) missingFields.push("DicomStore ID");
  if (!Value) missingFields.push("Value");
  if (missingFields.length > 0)
    return new ErrorHandler(
      400,
      "Missing fields: " + missingFields.toString(),
      missingFields,
      res
    );

  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  // const datasetId = "Patel_Hospital";
  // const dicomStoreId = "Faisalabad";
  const datasetId = DataSetID;
  const dicomStoreId = DicomStoreID;
  const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
  const dicomWebPath = "instances";
  const request = { parent, dicomWebPath };

  const instances =
    await healthcare.projects.locations.datasets.dicomStores.searchForInstances(
      request,
      {
        headers: { Accept: "application/dicom+json,multipart/related" },
      }
    );
  let newData = [];
  let addedKeys = [];
  const scansArray = [];
  instances.data.forEach((d) => {
    if (!addedKeys.includes(d["00100020"].Value[0])) {
      addedKeys.push(d["00100020"].Value[0]);
      newData.push(d);
    }
  });
  newData.forEach((d) => {
    if (d["00080060"].Value[0] === Value) {
      scansArray.push(d);
    }
  });
  // res.status(200).json({
  //   success: true,
  //   newData
  // })
  res.send(JSON.stringify(scansArray, null, 2));
});

//Jpeg File Download Route
router.get("/dicomWebRetrieveInstance", async (req, res, next) => {
  //File Handling Create PNG File
  const writeFile = util.promisify(fs.writeFile);
  const fileName = "rendered_image.jpeg";

  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  const datasetId = req.query.datasetId;
  const dicomStoreId = req.query.dicomStoreId;
  const studyUid = req.query.studyUid;
  const seriesUid = req.query.seriesUid;
  const instanceUid = req.query.instanceUid;

  //Validation

  const missingFields = [];
  if (!datasetId) missingFields.push("Dataset Id");
  if (!dicomStoreId) missingFields.push("Dicom Store Id");
  if (!studyUid) missingFields.push("Study Uid");
  if (!seriesUid) missingFields.push("Series Uid");
  if (!instanceUid) missingFields.push("Tnstance Uid");
  console.log(missingFields);
  if (missingFields.length > 0)
    return new ErrorHandler(
      500,
      "Missing fields: " + missingFields.toString(),
      missingFields,
      res
    );

  const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
  const dicomWebPath = `studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;
  const request = { parent, dicomWebPath };

  const rendered =
    await healthcare.projects.locations.datasets.dicomStores.studies.series.instances.retrieveRendered(
      request,
      {
        headers: { Accept: "image/jpeg" },
        responseType: "arraybuffer",
      }
    );
  const fileBytes = Buffer.from(rendered.data);

  await writeFile(fileName, fileBytes);
  var options = {
    root: path.join(__dirname),
  };
  // read binary data
  var bitmap = fs.readFileSync(fileName);
  // convert binary data to base64 encoded string
  const base64str = new Buffer(bitmap).toString("base64");
  res.status(200).json({
    success: true,
    base64str,
  });
});

//DCM and PNG file downloader
router.get("/dicomWebRetrieveInstance/dcmfile", async (req, res, next) => {
  //File Handling Create PNG File
const writeFile = util.promisify(fs.writeFile);
const fileName = 'rendered_image.jpeg';
  //Required data
  const cloudRegion = "us";
  const projectId = "rich-archery-387806";
  const datasetId = "System_1";
  const dicomStoreId = "Site_1A";
  const studyUid = "1.2.276.0.7230010.3.1.2.296485376.1.1521713579.1849134";
  const seriesUid = "1.2.276.0.7230010.3.1.3.296485376.1.1521713580.1849651";
  const instanceUid = "1.2.276.0.7230010.3.1.4.296485376.1.1521713580.1849652";
  const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
  const dicomWebPath = `studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;
  const request = {parent, dicomWebPath};

  const rendered =
    await healthcare.projects.locations.datasets.dicomStores.studies.series.instances.retrieveRendered(
      request,
      {
        headers: "application/octet-stream; transfer-syntax=1.2.840.10008.1.2.4.70",
        responseType: 'arraybuffer',
      }
    );
  // 1.2.840.10008.1.2.4.70
  const fileBytes = Buffer.from(rendered.data);

  await writeFile(fileName, fileBytes);
  var options = {
    root: path.join(__dirname),
  };
  // read binary data
  var bitmap = fs.readFileSync(fileName);
  // convert binary data to base64 encoded string
  res.status(200).sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log(
        `Retrieved rendered image and saved to ${fileName} in current directory`
      );
    }
  });
});

module.exports = router;
