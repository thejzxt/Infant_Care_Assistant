import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeModules } from "react-native";


import DateTimePicker from "@react-native-community/datetimepicker";

import notifee, {
  TriggerType,
  AndroidImportance,
} from "@notifee/react-native";



const { width } = Dimensions.get("window");
const { AlarmModule } = NativeModules;

const FeedingDashboardScreen = ({ route }) => {

  const today = new Date();
  const activeInfant = route?.params?.activeInfant ?? null;

  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [guideVisible, setGuideVisible] = useState(false);
  const [feedingGuide, setFeedingGuide] = useState(null);

  const [feedings, setFeedings] = useState([]);

  const [selectedFeedingIndex, setSelectedFeedingIndex] = useState(null);
  const [timeInput, setTimeInput] = useState("");

  const [isReminderOn, setIsReminderOn] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());


  const infantId = activeInfant?._id;

  const formatDate = (date) => date.toISOString().split("T")[0];

  const isFuture = selectedDate > today;

  /* ================= AGE ================= */

  const calculateAgeInMonths = (dobString) => {

    if (!dobString) return 0;

    const [day, month, year] = dobString.split("/");
    const birthDate = new Date(`${year}-${month}-${day}`);

    const now = new Date();

    return (
      (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth())
    );
  };

  const babyAge = calculateAgeInMonths(activeInfant?.dob);

  /* ================= FETCH GUIDE ================= */

  useEffect(() => {

    if (!activeInfant) return;

    const fetchGuide = async () => {

      try {
        const res = await fetch(
          `http://10.160.144.230:5000/api/feeding-guide/${babyAge}`
        );

        const data = await res.json();

        setFeedingGuide(data);
      } catch (err) {
        console.log("Guide error", err);
      }

    };

    fetchGuide();

  }, [activeInfant]);

  /* ================= FETCH LOG ================= */

  const fetchFeedingLog = async (date) => {

  if (!infantId) return;

  try {

    setFeedings([]);

    const formattedDate = formatDate(date);

    const res = await fetch(
      `http://10.160.144.230:5000/api/feeding-log/${infantId}/${formattedDate}/${babyAge}`
    );

    const data = await res.json();

    if (!data || !data.feeds) {
      setFeedings([]);
      return;
    }

    const now = new Date();

    const formattedFeeds = data.feeds.map((feed) => {

      let status = feed.status ? feed.status : "pending";

      const feedDate = getFeedingDateTime(feed.time);

      /* FIX: only mark missed for TODAY */

      if (
        selectedDate.toDateString() === now.toDateString() &&
        feedDate < now &&
        status === "pending"
      ) {
        status = "missed";
      }

      return {
        title: `Feeding ${feed.feedingNumber}`,
        time: feed.time,
        status: status,
      };

    });

    setFeedings(formattedFeeds);

  } catch (error) {
    console.log("Feeding log error", error);
    setFeedings([]);
  }
};

  useEffect(() => {

    if (infantId) {
      fetchFeedingLog(selectedDate);
    }

  }, [selectedDate, infantId]);

  /* ================= MARK COMPLETED ================= */

  const markCompleted = async (feedingNumber) => {

  const date = formatDate(selectedDate);

  try {

    await fetch(`http://10.160.144.230:5000/api/feeding-log/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        infantId,
        date,
        feedingNumber,
      }),
    });

   /* cancel delayed notification */

await notifee.cancelNotification(`Feeding ${feedingNumber}-delay`);

   
    fetchFeedingLog(selectedDate);

  } catch (err) {
    console.log(err);
  }
};

  /* ================= TIME PICKER ================= */

  const onTimeChange = (event, date) => {

    setShowTimePicker(false);

    if (!date) return;

    setSelectedTime(date);

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;

    const formatted =
      h + ":" + minutes.toString().padStart(2, "0") + " " + ampm;

    setTimeInput(formatted);
  };

/* ================= ALARM ================= */

const scheduleAlarm = async (feedingTitle, timeString) => {

  try {

    // ✅ ensure notification channel exists
    await notifee.createChannel({
      id: "feeding-alarm",
      name: "Feeding Alarm",
      importance: AndroidImportance.HIGH,
    });

    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const alarmDate = new Date();
    alarmDate.setHours(hours);
    alarmDate.setMinutes(minutes);
    alarmDate.setSeconds(0);

    if (alarmDate <= new Date()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const reminder10 = new Date(alarmDate.getTime() - 10 * 60 * 1000);
    const reminder5 = new Date(alarmDate.getTime() - 5 * 60 * 1000);

    await notifee.cancelNotification(feedingTitle);
    await notifee.cancelNotification(feedingTitle + "-reminder10");
    await notifee.cancelNotification(feedingTitle + "-reminder5");

    /* 10 MIN REMINDER */

    if (reminder10 > new Date()) {

      await notifee.createTriggerNotification(
        {
          id: feedingTitle + "-reminder10",
          title: "Upcoming Feeding 🍼",
          body: `${feedingTitle} in 10 minutes`,
          android: {
            channelId: "feeding-alarm",
            importance: AndroidImportance.HIGH,
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: reminder10.getTime(),
          alarmManager: { allowWhileIdle: true },
        }
      );
    }

    /* 5 MIN REMINDER */

    if (reminder5 > new Date()) {

      await notifee.createTriggerNotification(
        {
          id: feedingTitle + "-reminder5",
          title: "Upcoming Feeding 🍼",
          body: `${feedingTitle} in 5 minutes`,
          android: {
            channelId: "feeding-alarm",
            importance: AndroidImportance.HIGH,
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: reminder5.getTime(),
          alarmManager: { allowWhileIdle: true },
        }
      );
    }

    /* MAIN ALARM (native AlarmManager) */

    await AlarmModule.scheduleAlarm(
      alarmDate.getTime(),
      feedingTitle
    );
/* ================= DELAYED FEEDING CHECK ================= */

const feedingNumber = feedingTitle.split(" ")[1];

const delayTime = new Date(alarmDate.getTime() + 10 * 60 * 1000);

await notifee.createTriggerNotification(
  {
    id: `${feedingTitle}-delay`,
    title: "Feeding Delayed ⚠️",
    body: `${feedingTitle} marked as missed`,
    android: {
      channelId: "feeding-alarm",
      importance: AndroidImportance.HIGH,
    },
  },
  {
    type: TriggerType.TIMESTAMP,
    timestamp: delayTime.getTime(),
    alarmManager: { allowWhileIdle: true },
  }
);

/* update backend when delayed */

setTimeout(async () => {
  try {
    await fetch(`http://10.160.144.230:5000/api/feeding-log/missed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        infantId,
        date: formatDate(selectedDate),
        feedingNumber,
      }),
    });

    fetchFeedingLog(selectedDate);

  } catch (err) {
    console.log("Missed update error", err);
  }
}, 10 * 60 * 1000);

  } catch (error) {

    console.log("Alarm scheduling error", error);

  }
};
  /* ================= SAVE EDIT ================= */

  const saveEdit = async () => {

    const updated = [...feedings];

    updated[selectedFeedingIndex].time = timeInput;

    setFeedings(updated);

    if (isReminderOn) {
      await scheduleAlarm(
        updated[selectedFeedingIndex].title,
        timeInput
      );
    }

    setEditModalVisible(false);
  };

  /* ================= DATE STRIP ================= */

  const getWeekDates = () => {

    const dates = [];

    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const weekDates = getWeekDates();

  /* ================= CALENDAR ================= */

  const generateMonthDays = () => {

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const monthDays = generateMonthDays();

/* ================= TIME CHECK ================= */

const getFeedingDateTime = (timeString: string) => {

  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const feedDate = new Date(selectedDate);

  feedDate.setHours(hours);
  feedDate.setMinutes(minutes);
  feedDate.setSeconds(0);

  // ⭐ FIX: treat early morning feedings as next day
  if (hours >= 0 && hours < 5) {
    feedDate.setDate(feedDate.getDate() + 1);
  }

  return feedDate;
};
  /* ================= UI ================= */

  return (

    <SafeAreaView style={styles.container}>
      <ScrollView>

        <View style={styles.bannerContainer}>
          <Image
            source={require("../assets/images/baby_banner.jpeg")}
            style={styles.bannerImage}
          />
        </View>

        <TouchableOpacity
          style={styles.growthCard}
          onPress={() => setGuideVisible(true)}
        >
          <Text style={styles.babyName}>
            {activeInfant?.name || "Infant"}
          </Text>

          <Text style={styles.babyAge}>
            {babyAge} Months Old
          </Text>

          <Text style={styles.weightText}>
            {activeInfant?.weight} kg
          </Text>
        </TouchableOpacity>

        {/* WEEK STRIP */}

        <View style={{ marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weekDates.map((date, index) => {

              const isSelected =
                date.toDateString() === selectedDate.toDateString();

              const todayHighlight =
                date.toDateString() === today.toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDate(date)}
                >
                  <View
                    style={[
                      styles.dateCard,
                      isSelected && styles.selectedCircle,
                      todayHighlight && styles.todayCircle,
                    ]}
                  >
                    <Text style={styles.dateDay}>
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </Text>

                    <Text style={styles.dateNumber}>
                      {date.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* MONTH HEADER */}

        <TouchableOpacity
          onPress={() => setCalendarVisible(true)}
          style={{ paddingHorizontal: 20, marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {selectedDate.toDateString()}
          </Text>
        </TouchableOpacity>

        {/* FEEDING LIST */}

        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>
            Feeding Schedule
          </Text>

          {feedings.map((item, index) => (
            <TouchableOpacity
              key={index}
              disabled={isFuture}
              onPress={() => {

  const feedTime = getFeedingDateTime(item.time);
  const now = new Date();

  if (!isFuture && feedTime > now && item.status !== "missed") {

    setSelectedFeedingIndex(index);
    setTimeInput(item.time);
    setEditModalVisible(true);

  }

}}
            >
              <View
                style={[
                  styles.activityCard,
                  item.status === "completed" && styles.completedCard,
                  item.status === "missed" && styles.missedCard,
                  isFuture && styles.disabledCard,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Text>
                    {item.status === "completed"
                      ? "✅"
                      : item.status === "missed"
                      ? "❌"
                      : "🍼"}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.activitySub}>
                    {item.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* EDIT MODAL */}

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>

            <Text style={styles.modalTitle}>
              Edit Feeding Time
            </Text>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{timeInput || "Select Time"}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={false}
                display="clock"
                onChange={onTimeChange}
              />
            )}

            <View style={styles.switchRow}>
              <Text>Reminder</Text>

              <Switch
                value={isReminderOn}
                onValueChange={setIsReminderOn}
              />
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={saveEdit}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.doneButton,{backgroundColor:"#1BAA5C"}]}
              onPress={()=>{
                markCompleted(selectedFeedingIndex+1)
                setEditModalVisible(false)
              }}
            >
              <Text style={{color:"#fff"}}>Mark Done</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* CALENDAR MODAL */}

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContainer}>

            <Text style={styles.calendarTitle}>Select Date</Text>

            <View style={styles.daysGrid}>
              {monthDays.map((day,index)=>{
                if(!day) return <View key={index} style={styles.emptyDay}/>

                const isSelected =
                  day.toDateString()===selectedDate.toDateString()

                return(
                  <TouchableOpacity
                    key={index}
                    style={[styles.dayItem,isSelected&&styles.selectedCircle]}
                    onPress={()=>{
                      setSelectedDate(day)
                      setCalendarVisible(false)
                    }}
                  >
                    <Text style={styles.dayText}>{day.getDate()}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

          </View>
        </View>
      </Modal>

      {/* FEEDING GUIDE */}

      <Modal visible={guideVisible} animationType="slide">
        <ScrollView style={{flex:1,padding:20}}>

          <Text style={styles.guideTitle}>
            Feeding Guide ({babyAge} Months)
          </Text>

          {feedingGuide && (
            <>
              <Text style={styles.guideSection}>Milk Amount</Text>
              <Text>{feedingGuide.milkAmount}</Text>

              <Text style={styles.guideSection}>Frequency</Text>
              <Text>{feedingGuide.frequency}</Text>

              <Text style={styles.guideSection}>Breast Feeding</Text>
              <Text>{feedingGuide.breastFeeding}</Text>

              <Text style={styles.guideSection}>Formula Feeding</Text>
              <Text>{feedingGuide.formulaFeeding}</Text>

              <Text style={styles.guideSection}>Solid Feeding</Text>
              <Text>{feedingGuide.solidFeeding}</Text>

              <Text style={styles.guideSection}>Cereals</Text>
              <Text>{feedingGuide.cereals}</Text>

              <Text style={styles.guideSection}>Fruits</Text>
              <Text>{feedingGuide.fruits}</Text>

              <Text style={styles.guideSection}>Vegetables</Text>
              <Text>{feedingGuide.vegetables}</Text>

              <Text style={styles.guideSection}>Proteins</Text>
              <Text>{feedingGuide.proteins}</Text>

              <Text style={styles.guideSection}>Snacks</Text>
              <Text>{feedingGuide.snacks}</Text>

              <Text style={styles.guideSection}>Development Notes</Text>
              <Text>{feedingGuide.developmentNotes}</Text>
            </>
          )}

          <TouchableOpacity
            onPress={()=>setGuideVisible(false)}
            style={styles.doneButton}
          >
            <Text style={{color:"#fff"}}>Close</Text>
          </TouchableOpacity>

        </ScrollView>
      </Modal>

    </SafeAreaView>
  );
};

export default FeedingDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },

  /* ===== BANNER ===== */
  bannerContainer: {
    height: 250,
  },

  bannerImage: {
    width: "100%",
    height: "100%",
  },

  /* ===== GROWTH CARD ===== */
  growthCard: {
    backgroundColor: "#67b3ec",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 22,
    marginTop: -20,
    elevation: 10,
  },

  babyName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  babyAge: {
    color: "#EAF6FF",
    marginTop: 4,
    fontSize: 14,
  },

  weightText: {
  color: "#ffffff",
  fontSize: 16,
  marginTop: 6,
  fontWeight: "600",
},

guideTitle: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 20,
},

guideSection: {
  fontWeight: "bold",
  marginTop: 15,
},

  /* ===== FEEDING LIST ===== */
  activityContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 3,
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F0F1FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  activityTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },

  activitySub: {
    color: "gray",
    marginTop: 4,
  },

  disabledCard: {
    backgroundColor: "#F2F2F2",
  },

  /* ===== MODAL ===== */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  doneButton: {
    backgroundColor: "#47a9e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#4f98d8",
    padding: 15,
    alignItems: "center",
    borderRadius: 15,
  },

  /* ===== DATE STRIP (kept for future use) ===== */

  dateStripContainer: {
    marginBottom: 20,
  },

  dateCard: {
    width: 65,
    height: 80,
    borderRadius: 18,
    backgroundColor: "#F1F3F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activeDateCard: {
    backgroundColor: "#47a9e5",
  },

  dateDay: {
    fontSize: 13,
    color: "#555",
  },

  dateNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
    color: "#333",
  },

  activeDateText: {
    color: "#fff",
  },

  /* ===== CALENDAR (future backend feature ready) ===== */

  calendarOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  calendarContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  navArrow: {
    fontSize: 28,
    fontWeight: "bold",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  emptyDay: {
    width: width / 7 - 10,
    height: 45,
  },

  dayItem: {
    width: width / 7 - 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },

  dayText: {
    fontSize: 16,
  },

  todayCircle: {
    borderWidth: 2,
    borderColor: "#47a9e5",
    borderRadius: 25,
  },

  selectedCircle: {
    backgroundColor: "#47a9e5",
    borderRadius: 25,
  },

  completedCard: {
    backgroundColor: "#E8F9F1",
  },

  completedText: {
    color: "#1BAA5C",
    fontWeight: "600",
  },

  missedCard: {
    backgroundColor: "#FFECEC",
  },

  missedText: {
    color: "#E53935",
    fontWeight: "600",
  },

  statusBadge: {
    fontSize: 12,
  },
});