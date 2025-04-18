import { setFanValue, toggleFan, FanDevice } from "@/store/fanDevicesSlice";
import { AppDispatch } from "@/store";

export function handleForAll(
  command: string,
  dispatch: AppDispatch,
  devices: Array<FanDevice>
) {
  const normalizedCommand = command.toLowerCase();
  console.log("Processing command:", normalizedCommand);

  // Xác định hành động: bật/tắt/tăng/giảm
  let action = "";
  if (normalizedCommand.includes("tắt")) {
    action = "off";
  } else if (
    normalizedCommand.includes("bật") ||
    normalizedCommand.includes("mở")
  ) {
    action = "on";
  } else if (normalizedCommand.includes("tăng")) {
    action = "increase";
  } else if (normalizedCommand.includes("giảm")) {
    action = "decrease";
  } else {
    // Đặt quạt số $number ở (mức)? number %
    // Kiểm tra xem có yêu cầu đặt mức cụ thể không
    const percentMatch = normalizedCommand.match(/(\d+)(\s*%|\s*phần trăm)/);
    const setLevelMatch = normalizedCommand.match(
      /quạt\s+(số\s+)?(\d+)\s+(?:ở\s+)?mức\s+(\d+)/i
    );

    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        // Xác định đối tượng: tất cả quạt hoặc quạt cụ thể
        if (
          normalizedCommand.includes("tất cả") ||
          normalizedCommand.includes("hết")
        ) {
          console.log(`Setting all fans to ${percent}%`);
          devices.forEach((device) => {
            dispatch(setFanValue({ id: device.id, value: percent }));
          });
          return;
        }

        // Tìm số quạt trong câu nói
        const numbers = normalizedCommand.match(/quạt\s+(số\s+)?(\d+)/g) || [];
        numbers.forEach((match) => {
          const matchResult = match.match(/\d+/);
          if (matchResult) {
            const num = matchResult[0];
            const deviceId = `dadn-fan-${num}`;
            devices.forEach((device) => {
              if (device.id === deviceId) {
                console.log(`Setting fan ${num} to ${percent}%`);
                dispatch(setFanValue({ id: device.id, value: percent }));
              } else {
                console.log(`Fan ${num} not found`);
              }
            });
          }
        });
        return;
      }
    } else if (setLevelMatch) {
      const fanNumber = parseInt(setLevelMatch[2]);
      const level = parseInt(setLevelMatch[3]);

      if (!isNaN(fanNumber) && !isNaN(level) && level >= 0 && level <= 100) {
        const deviceId = `dadn-fan-${fanNumber}`;
        const device = devices.find((device) => device.id === deviceId);
        if (device) {
          console.log(`Setting fan ${fanNumber} to level ${level}`);
          dispatch(setFanValue({ id: device.id, value: level }));
        } else {
          console.log(`Fan ${fanNumber} not found`);
        }
        return;
      }
    }

    console.log("No valid action found in command");
    return;
  }

  // Xác định đối tượng: tất cả quạt hoặc quạt cụ thể
  if (
    normalizedCommand.includes("tất cả") ||
    normalizedCommand.includes("hết")
  ) {
    console.log("Controlling all fans:", action);
    devices.forEach((device) => {
      dispatch(toggleFan({ id: device.id, action }));
    });
    return;
  }

  // Tìm số quạt trong câu nói
  const numbers = normalizedCommand.match(/\d+/g) || [];
  if (numbers.length > 0) {
    numbers.forEach((num) => {
      const deviceId = `dadn-fan-${num}`;
      const device = devices.find((device) => device.id === deviceId);
      if (device) {
        console.log(`Controlling fan ${num}:`, action);
        dispatch(toggleFan({ id: device.id, action }));
      } else {
        console.log(`Fan ${num} not found`);
      }
    });
    return;
  }

  // Nếu không tìm thấy số cụ thể, thử điều khiển quạt đầu tiên
  if (devices.length > 0) {
    console.log("Controlling first fan:", action);
    dispatch(toggleFan({ id: devices[0].id, action }));
  }
}

export function handleForOne(
  command: string,
  fanId: string,
  dispatch: AppDispatch,
  devices: Array<FanDevice>
) {
  const normalizedCommand = command.toLowerCase();
  console.log("Processing command:", normalizedCommand);

  // Xác định hành động: bật/tắt/tăng/giảm
  let action = "";
  if (normalizedCommand.includes("tắt")) {
    action = "off";
  } else if (
    normalizedCommand.includes("bật") ||
    normalizedCommand.includes("mở")
  ) {
    action = "on";
  } else if (normalizedCommand.includes("tăng")) {
    action = "increase";
  } else if (normalizedCommand.includes("giảm")) {
    action = "decrease";
  } else {
    // Đặt quạt số $number ở (mức)? number %
    // Kiểm tra xem có yêu cầu đặt mức cụ thể không
    const percentMatch = normalizedCommand.match(/(\d+)(\s*%|\s*phần trăm)/);
    const setLevelMatch = normalizedCommand.match(
      /quạt\s+(số\s+)?(\d+)\s+(?:ở\s+)?mức\s+(\d+)/i
    );

    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        // Xác định đối tượng: tất cả quạt hoặc quạt cụ thể
        console.log(`Setting fan to ${percent}%`);
        dispatch(setFanValue({ id: fanId, value: percent }));
        return;
      }
    } else if (setLevelMatch) {
      const fanNumber = parseInt(setLevelMatch[2]);
      const level = parseInt(setLevelMatch[3]);

      if (!isNaN(level) && level >= 0 && level <= 100) {
        if (devices.some((device) => device.id === fanId)) {
          console.log(`Setting fan ${fanNumber} to ${level}%`);
          dispatch(setFanValue({ id: fanId, value: level }));
        } else {
          console.log(`Fan ${fanNumber} not found`);
        }
        return;
      }
    }

    console.log("No valid action found in command");
    return;
  }

  // Xác định đối tượng: tất cả quạt hoặc quạt cụ thể
  console.log("Controlling fan:", action);
  dispatch(toggleFan({ id: fanId, action }));
}
