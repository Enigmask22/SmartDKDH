import { AppDispatch } from "@/store";
import { toggleLed, LedDevice } from "@/store/ledDevicesSlice";

const findDeviceByDescription = (
  description: string,
  devices: Array<LedDevice>
) => {
  const device = devices.find(
    (d) => d.description.toLowerCase() === description
  );
  return device ? device.id : null;
};

export const handleForAll = (
  command: string,
  devices: Array<LedDevice>,
  dispatch: AppDispatch
) => {
  console.log("Processing command:", command);

  // Chuẩn hóa chuỗi tiếng Việt
  const normalizedCommand = command
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  console.log("Normalized command:", normalizedCommand);

  const isOff = normalizedCommand.includes("tat");
  const isOn = normalizedCommand.includes("bat");
  console.log("isOff:", isOff);
  console.log("isOn:", isOn);
  let status: string;
  if (isOn) {
    status = "1";
  } else if (isOff) {
    status = "0";
  } else {
    // Handle the case when neither condition is true
    console.log("Command not recognized as on or off");
    return; // Exit early if we can't determine on/off
  }

  // Now we can safely use status since it's definitely assigned
  if (normalizedCommand.includes("het")) {
    for (const device of devices) {
      const deviceId = device.id;
      dispatch(toggleLed({ id: deviceId, newStatus: status }));
    }
    return;
  }

  // Find LED number in the command
  const numbers = normalizedCommand.match(/\d+/g) || [];
  if (numbers.length > 0) {
    numbers.forEach((num) => {
      const deviceId = `dadn-led-${num}`;
      dispatch(toggleLed({ id: deviceId, newStatus: status }));
    });
    return;
  }

  // Find room name in the command
  // normalizedCommand.includes(roomName)
  for (const device of devices) {
    const deviceId = device.id;
    const deviceDescription = device.description
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (normalizedCommand.includes(deviceDescription)) {
      const deviceId = findDeviceByDescription(deviceDescription, devices);
      if (deviceId) {
        dispatch(toggleLed({ id: deviceId, newStatus: status }));
        return;
      }
    }
  }
};
