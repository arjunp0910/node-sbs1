assert = require('assert');


var MessageType = {
  // Generated when the user changes the selected aircraft in
  // BaseStation.
  SELECTION_CHANGE: 'SEL',
  // Generated when an aircraft being tracked sets or changes its
  // callsign.
  NEW_ID: 'ID',
  // Generated when the SBS picks up a signal for an aircraft that it
  // isn't currently tracking,
  NEW_AIRCRAFT: 'AIR',
  // Generated when an aircraft's status changes according to the
  // time-out values in the Data Settings menu.
  STATUS_CHANGE: 'STA',
  // Generated when the user double-clicks (or presses return) on an
  // aircraft (i.e. to bring up the aircraft details window).
  CLICK: 'CLK',
  // Generated by the aircraft. There are eight different MSG types.
  TRANSMISSION: 'MSG'
};


// Transmission messages (MSG) from aircraft may be one of eight types
// (ES = Extended Squitter, DF = Datalink Format):
//
// MSG,1 | ES Identification and Category  | DF17 BDS 0,8
//
// MSG,2 | ES Surface Position Message     | DF17 BDS 0,6
//   Triggered by nose gear squat switch.
//
// MSG,3 | ES Airborne Position Message    | DF17 BDS 0,5
//
// MSG,4 | ES Airborne Velocity Message    | DF17 BDS 0,9
//
// MSG,5 | Surveillance Alt Message        | DF4, DF20
//   Triggered by ground radar. Not CRC secured. MSG,5 will only be
//   output if the aircraft has previously sent a MSG,1, 2, 3, 4 or 8
//   signal.
//
// MSG,6 | Surveillance ID Message         | DF5, DF21
//   Triggered by ground radar. Not CRC secured.  MSG,6 will only be
//   output if the aircraft has previously sent a MSG,1, 2, 3, 4 or 8
//   signal.
//
// MSG,7 | Air To Air Message DF16
//   Triggered from TCAS.  MSG,7 is now included in the SBS socket
//   output.
//
// MSG,8 | All Call Reply                  | DF11
//   Broadcast but also triggered by ground radar

var TransmissionType = {
  ES_IDENT_AND_CATEGORY: 1,
  ES_SURFACE_POS: 2,
  ES_AIRBORNE_POS: 3,
  ES_AIRBORNE_VEL: 4,
  SURVEILLANCE_ALT: 5,
  SURVEILLANCE_ID: 6,
  AIR_TO_AIR: 7,
  ALL_CALL_REPLY: 8
};


// Field 1: MSG
// Field 2: Transmission Type
// Field 3: System-generated SessionID
// Field 4: System-generated AircraftID
// Field 5: HexIdent
// Field 6: System-generated FlightID
// Field 7: Date message generated
// Field 8: Time message generated
// Field 9: Date message logged
// Field 10: Time message logged
// Field 11: Callsign
// Field 12: Altitude
// Field 13: GroundSpeed
// Field 14: Track
// Field 15: Lat
// Field 16: Long
// Field 17: VerticalRate
// Field 18: Squawk
// Field 19: Alert
// Field 20: Emergency
// Field 21: SPI
// Field 22: IsOnGround

SBS1Message = function(parts) {
  parts = parts.map(function (e) {
    if (e === '') {
      return null;
    } else {
      return e;
    }
    });
  this.message_type = parts[0];
  this.transmission_type = sbs1_value_to_int(parts[1]);
  if (this.message_type == MessageType.TRANSMISSION_TYPE &&
      this.transmission_type < 1 || this.transmission_type > 8) {
    throw new Error('Unknown message type: ' + parts[1]);
  }
  this.session_id = sbs1_value_to_int(parts[2]);
  this.aircraft_id = sbs1_value_to_int(parts[3]);
  this.hex_ident = parts[4];
  this.flight_id = sbs1_value_to_int(parts[5]);
  this.generated_date = parts[6];
  this.generated_time = parts[7];
  this.logged_date = parts[8];
  this.logged_time = parts[9];
  this.callsign = parts[10];
  this.altitude = sbs1_value_to_int(parts[11]);
  this.ground_speed = sbs1_value_to_int(parts[12]);
  this.track = sbs1_value_to_int(parts[13]);
  this.lat = sbs1_value_to_float(parts[14]);
  this.lon = sbs1_value_to_float(parts[15]);
  this.vertical_rate = sbs1_value_to_int(parts[16]);
  this.squawk = parts[17];
  this.alert = sbs1_value_to_bool(parts[18]);
  this.emergency = sbs1_value_to_bool(parts[19]);
  this.spi = sbs1_value_to_bool(parts[20]);
  this.is_on_ground = sbs1_value_to_bool(parts[21]);
}

SBS1Message.prototype.generated_timestamp = function() {
  return new Date(this.generated_date + ' ' + this.generated_time);
};

SBS1Message.prototype.logged_timestamp = function() {
  return new Date(this.logged_date + ' ' + this.logged_time);
};


function sbs1_value_to_bool(v) {
  if (v === undefined || v === null) {
    return v;
  } else if (v === '') {
    return null;
  } else {
    return !(v === '0');
  }
}

function sbs1_value_to_int(v) {
  if (v != undefined && v != null) {
    return parseInt(v, 10);
  } else {
    return null;
  }
}

function sbs1_value_to_float(v) {
  if (v != undefined && v != null) {
    return parseFloat(v);
  } else {
    return null;
  }
}

function sbs1_value_to_date(v) {
  if (v != undefined && v != null) {
    return new Date(v);
  } else {
    return null;
  }
}

function sbs1_value_to_time(v) {
  if (v != undefined && v != null) {
    return new Date(v);
  } else {
    return null;
  }
}

function parse_sbs1_message(s) {
  var parts = s.split(',');
  m = new SBS1Message(parts)
  return m;
}


exports.parse_sbs1_message = parse_sbs1_message;
exports.MessageType = MessageType;
exports.TransmissionType = TransmissionType;
