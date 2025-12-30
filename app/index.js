// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Modal
    } from "react-native";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    const MONTHS = [
      { name: "OCA", days: 31 }, { name: "ŞUB", days: 28 }, { name: "MAR", days: 31 },
        { name: "NİS", days: 30 }, { name: "MAY", days: 31 }, { name: "HAZ", days: 30 },
          { name: "TEM", days: 31 }, { name: "AĞU", days: 31 }, { name: "EYL", days: 30 },
            { name: "EKİ", days: 31 }, { name: "KAS", days: 30 }, { name: "ARA", days: 31 },
            ];

            const COLORS = [
              "#1a0000", "#001a00", "#000d1a", "#1a1a00", "#1a001a", "#001a1a",
                "#1a1000", "#0d1a00", "#11001a", "#1a0000", "#001a0d", "#0d001a",
                ];

                const CELL_WIDTH = 65;
                const DAY_COLUMN_WIDTH = 35;
                const ROW_HEIGHT = 35;

                const GridCell = React.memo(({ value, hasNote, monthIndex, dayIndex, onPress, onLongPress, disabled }) => {
                  if (disabled) return <View style={[styles.cell, styles.disabledCell]} />;
                    return (
                        <TouchableOpacity
                              style={[styles.cell, { backgroundColor: COLORS[monthIndex] }]}
                                    onPress={() => onPress(dayIndex, monthIndex)}
                                          onLongPress={() => onLongPress(dayIndex, monthIndex)}
                                              >
                                                    <Text style={styles.cellText}>{value}</Text>
                                                          {hasNote && <View style={styles.noteIndicator} />}
                                                              </TouchableOpacity>
                                                                );
                                                                });
                                                                export default function Index() {
                                                                  const [year, setYear] = useState(new Date().getFullYear());
                                                                  const [data, setData] = useState({});
                                                                  const [notes, setNotes] = useState({});
                                                                  const [tutarlar, setTutarlar] = useState(Array(12).fill("1000"));
                                                                  const [noteModal, setNoteModal] = useState({ visible: false, d: 0, m: 0, text: "" });
                                                                
                                                                  const STORAGE_KEY = `@data_${year}`;
                                                                  const NOTES_KEY = `@notes_${year}`;
                                                                  const TUTAR_KEY = `@tutar_${year}`;
                                                                
                                                                  const isLeapYear = useCallback((y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, []);
                                                                  const saveTimeout = useRef(null);
                                                                
                                                                  const debounceSave = (key, value) => {
                                                                    if (saveTimeout.current) clearTimeout(saveTimeout.current);
                                                                    saveTimeout.current = setTimeout(() => {
                                                                      AsyncStorage.setItem(key, JSON.stringify(value));
                                                                    }, 500);
                                                                  };
                                                                
                                                                  useEffect(() => {
                                                                    const load = async () => {
                                                                      try {
                                                                        const [d, n, t] = await Promise.all([
                                                                          AsyncStorage.getItem(STORAGE_KEY),
                                                                          AsyncStorage.getItem(NOTES_KEY),
                                                                          AsyncStorage.getItem(TUTAR_KEY)
                                                                        ]);
                                                                        setData(d ? JSON.parse(d) : {});
                                                                        setNotes(n ? JSON.parse(n) : {});
                                                                        setTutarlar(t ? JSON.parse(t) : Array(12).fill("1000"));
                                                                      } catch (e) { console.error("Hata:", e); }
                                                                    };
                                                                    load();
                                                                  }, [year]);
                                                                
                                                                  const toggleCell = useCallback((d, m) => {
                                                                    setData((prev) => {
                                                                      const key = `${d}-${m}`;
                                                                      const v = prev[key] || "";
                                                                      const cycle = ["", "X", "X+/", "/", "/+/", "X+X"];
                                                                      const next = cycle[(cycle.indexOf(v) + 1) % cycle.length];
                                                                      const newData = { ...prev, [key]: next };
                                                                      debounceSave(STORAGE_KEY, newData);
                                                                      return newData;
                                                                    });
                                                                  }, [STORAGE_KEY]);
                                                                
                                                                  const getWeight = (v) => {
                                                                    const weights = { "X": 1, "X+/": 1.5, "/": 0.5, "/+/": 1, "X+X": 2 };
                                                                    return weights[v] || 0;
                                                                  };
                                                                
                                                                  const monthTotals = useMemo(() => {
                                                                    return MONTHS.map((_, mIdx) => {
                                                                      let total = 0;
                                                                      const max = (mIdx === 1 && isLeapYear(year)) ? 29 : MONTHS[mIdx].days;
                                                                      for (let d = 0; d < max; d++) {
                                                                        total += getWeight(data[`${d}-${mIdx}`]);
                                                                      }
                                                                      return total;
                                                                    });
                                                                  }, [data, year, isLeapYear]);
                                                                  return (
                                                                    <SafeAreaView style={styles.container}>
                                                                      <StatusBar barStyle="light-content" />
                                                                      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex: 1}}>
                                                                        <View style={styles.topHeader}>
                                                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                                            {[2024, 2025, 2026, 2027].map((y) => (
                                                                              <TouchableOpacity key={y} onPress={() => setYear(y)} style={[styles.yearBtn, year === y && styles.yearActive]}>
                                                                                <Text style={styles.yearText}>{y}</Text>
                                                                              </TouchableOpacity>
                                                                            ))}
                                                                          </ScrollView>
                                                                        </View>
                                                                
                                                                        <ScrollView horizontal bounces={false}>
                                                                          <View>
                                                                            <View style={styles.headerRow}>
                                                                              <Text style={styles.dayHeader}>GÜN</Text>
                                                                              {MONTHS.map((m) => <Text key={m.name} style={styles.monthHeader}>{m.name}</Text>)}
                                                                            </View>
                                                                            <ScrollView style={styles.gridScroll} bounces={false}>
                                                                              {Array.from({ length: 31 }).map((_, d) => (
                                                                                <View key={d} style={styles.row}>
                                                                                  <View style={styles.dayCell}><Text style={styles.dayText}>{d + 1}</Text></View>
                                                                                  {MONTHS.map((m, mIdx) => (
                                                                                    <GridCell
                                                                                      key={`${d}-${mIdx}`}
                                                                                      value={data[`${d}-${mIdx}`] || ""}
                                                                                      hasNote={!!notes[`${d}-${mIdx}`]}
                                                                                      monthIndex={mIdx}
                                                                                      dayIndex={d}
                                                                                      onPress={toggleCell}
                                                                                      onLongPress={() => setNoteModal({ visible: true, d, m: mIdx, text: notes[`${d}-${mIdx}`] || "" })}
                                                                                      disabled={d + 1 > ((mIdx === 1 && isLeapYear(year)) ? 29 : m.days)}
                                                                                    />
                                                                                  ))}
                                                                                </View>
                                                                              ))}
                                                                            </ScrollView>
                                                                
                                                                            <View style={styles.footer}>
                                                                              <View style={styles.footerRow}>
                                                                                <Text style={styles.footerLabel}>TL/GÜN</Text>
                                                                                {MONTHS.map((_, i) => (
                                                                                  <View key={i} style={styles.footerCell}>
                                                                                    <TextInput
                                                                                      style={styles.tutarInput}
                                                                                      keyboardType="numeric"
                                                                                      value={tutarlar[i]}
                                                                                      onChangeText={(val) => {
                                                                                        const t = [...tutarlar]; t[i] = val; 
                                                                                        setTutarlar(t);
                                                                                        debounceSave(TUTAR_KEY, t);
                                                                                      }}
                                                                                    />
                                                                                  </View>
                                                                                ))}
                                                                              </View>
                                                                              <View style={styles.footerRow}>
                                                                                <Text style={styles.footerLabel}>GÜN</Text>
                                                                                {MONTHS.map((_, i) => (
                                                                                  <View key={i} style={styles.footerCell}><Text style={styles.totalVal}>{monthTotals[i]}</Text></View>
                                                                                ))}
                                                                              </View>
                                                                              <View style={[styles.footerRow, { backgroundColor: '#111' }]}>
                                                                                <Text style={[styles.footerLabel, { color: '#4CAF50' }]}>TOPLAM</Text>
                                                                                {MONTHS.map((_, i) => (
                                                                                  <View key={i} style={styles.footerCell}>
                                                                                    <Text style={styles.moneyText}>
                                                                                      {(monthTotals[i] * parseFloat(tutarlar[i].replace(',', '.') || 0)).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}₺
                                                                                    </Text>
                                                                                  </View>
                                                                                ))}
                                                                              </View>
                                                                            </View>
                                                                          </View>
                                                                        </ScrollView>
                                                                
                                                                        <Modal visible={noteModal.visible} transparent animationType="fade">
                                                                          <View style={styles.modalOverlay}>
                                                                            <View style={styles.modalContent}>
                                                                              <Text style={styles.modalTitle}>{noteModal.d+1} {MONTHS[noteModal.m]?.name} Notu</Text>
                                                                              <TextInput style={styles.noteInput} multiline value={noteModal.text} onChangeText={(t) => setNoteModal({...noteModal, text: t})} placeholder="Not..." placeholderTextColor="#666" />
                                                                              <View style={styles.modalButtons}>
                                                                                <TouchableOpacity onPress={() => setNoteModal({...noteModal, visible: false})} style={styles.cancelBtn}><Text style={{color: '#fff'}}>İptal</Text></TouchableOpacity>
                                                                                <TouchableOpacity onPress={() => {
                                                                                   const newNotes = { ...notes, [`${noteModal.d}-${noteModal.m}`]: noteModal.text };
                                                                                   setNotes(newNotes);
                                                                                   debounceSave(NOTES_KEY, newNotes);
                                                                                   setNoteModal({ ...noteModal, visible: false });
                                                                                }} style={styles.saveBtn}><Text style={{color: '#fff', fontWeight: 'bold'}}>Kaydet</Text></TouchableOpacity>
                                                                              </View>
                                                                            </View>
                                                                          </View>
                                                                        </Modal>
                                                                      </KeyboardAvoidingView>
                                                                    </SafeAreaView>
                                                                  );
                                                                }
                                                                
                                                                const styles = StyleSheet.create({
                                                                  container: { flex: 1, backgroundColor: "#000" },
                                                                  topHeader: { paddingVertical: 8, backgroundColor: '#050505', borderBottomWidth: 1, borderColor: '#222' },
                                                                  yearBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
                                                                  yearActive: { backgroundColor: "#CC0000", borderColor: '#FF3333' },
                                                                  yearText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
                                                                  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#333", backgroundColor: '#000' },
                                                                  dayHeader: { width: DAY_COLUMN_WIDTH, color: "yellow", textAlign: "center", paddingVertical: 10, fontSize: 10, fontWeight: 'bold' },
                                                                  monthHeader: { width: CELL_WIDTH, color: "#fff", textAlign: "center", paddingVertical: 10, fontSize: 11, fontWeight: "bold" },
                                                                  gridScroll: { flex: 1 },
                                                                  row: { flexDirection: "row" },
                                                                  dayCell: { width: DAY_COLUMN_WIDTH, height: ROW_HEIGHT, justifyContent: "center", alignItems: "center", borderBottomWidth: 0.5, borderColor: "#222", backgroundColor: '#050505' },
                                                                  dayText: { color: "#666", fontSize: 11, fontWeight: 'bold' },
                                                                  cell: { width: CELL_WIDTH, height: ROW_HEIGHT, justifyContent: "center", alignItems: "center", borderWidth: 0.3, borderColor: "rgba(255,255,255,0.05)" },
                                                                  cellText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
                                                                  noteIndicator: { position: 'absolute', top: 3, right: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: 'yellow' },
                                                                  disabledCell: { backgroundColor: "#000", opacity: 0.2 },
                                                                  footer: { backgroundColor: "#050505", borderTopWidth: 2, borderColor: "#CC0000" },
                                                                  footerRow: { flexDirection: "row", alignItems: "center", height: 45, borderBottomWidth: 0.5, borderColor: '#222' },
                                                                  footerLabel: { width: DAY_COLUMN_WIDTH, color: "yellow", fontSize: 8, textAlign: "center", fontWeight: "bold" },
                                                                  footerCell: { width: CELL_WIDTH, justifyContent: "center", alignItems: "center" },
                                                                  tutarInput: { width: '85%', height: 30, backgroundColor: '#111', color: 'yellow', textAlign: 'center', borderRadius: 6, fontWeight: 'bold', fontSize: 12, borderWidth: 1, borderColor: '#333' },
                                                                  totalVal: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
                                                                  moneyText: { color: "#4CAF50", fontSize: 11, fontWeight: "bold" },
                                                                  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
                                                                  modalContent: { width: '85%', backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
                                                                  modalTitle: { color: '#fff', fontSize: 16, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
                                                                  noteInput: { backgroundColor: '#000', color: '#fff', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 15, borderWidth: 1, borderColor: '#333' },
                                                                  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
                                                                  saveBtn: { backgroundColor: '#CC0000', padding: 12, borderRadius: 12, flex: 1, marginLeft: 8, alignItems: 'center' },
                                                                  cancelBtn: { backgroundColor: '#333', padding: 12, borderRadius: 12, flex: 1, marginRight: 8, alignItems: 'center' }
                                                                });
                                                                                                                                           