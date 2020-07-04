<template>
  <div class="dateButton">
    <v-btn v-if="!isOpenDatePicker" @click="openDatePicker"
      >Add Closing Date</v-btn
    >
    <div v-if="isOpenDatePicker">
      <v-container>
        <v-col cols="12" lg="6">
          <v-menu
            ref="menu1"
            v-model="menu1"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="dateFormatted"
                label="Closing Date"
                hint="MM/DD/YYYY format"
                persistent-hint
                prepend-icon="mdi-calendar"
                @blur="date = parseDate(dateFormatted)"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="date"
              no-title
              @input="menu1 = false"
              :allowed-dates="allowedDates"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-container>
      <v-btn @click="cancelDatePicker" v-if="!defaultDate"
        >Cancel Input Date</v-btn
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
@Component({
  name: "editDateButton"
})
export default class extends Vue {
  private date = "";
  private isOpenDatePicker = false;
  private tommorow = "";
  private dateFormatted = "";
  private menu1 = false;
  private currentDate: string = new Date().toISOString().substr(0, 10);

  @Prop({ default: "" }) private defaultDate!: string;

  private get computedDateFormatted() {
    return this.formatDate(this.date);
  }

  created() {
    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate() + 1);
    this.tommorow = this.parseDateMMDDYYYY(
      tommorow.toLocaleString().substr(0, 10)
    );
    this.date = this.defaultDate || this.tommorow;
    if (this.defaultDate) this.isOpenDatePicker = true;
    this.dateFormatted = this.formatDate(this.date);
  }

  @Watch("date")
  updateFormatDate() {
    this.dateFormatted = this.formatDate(this.date);
    if (this.isOpenDatePicker)
      this.$emit("set", this.parseDate(this.dateFormatted) + " 00:00:00.000");
  }

  public allowedDates(val: string) {
    const date1 = new Date();
    const date2 = new Date(val);
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth() + 1;
    const day1 = date1.getDate();

    const year2 = date2.getFullYear();
    const month2 = date2.getMonth() + 1;
    const day2 = date2.getDate();

    if (year1 == year2) {
      if (month1 == month2) {
        return day1 < day2;
      } else {
        return month1 < month2;
      }
    } else {
      return year1 < year2;
    }
  }

  public openDatePicker() {
    this.isOpenDatePicker = true;
    this.$emit("set", this.parseDate(this.dateFormatted) + " 00:00:00.000");
  }

  public cancelDatePicker() {
    this.isOpenDatePicker = false;
    this.date = this.tommorow;
    this.$emit("set", null);
  }

  public setDate(date: string) {
    this.date = date;
    this.isOpenDatePicker = true;
    this.$emit("set", date + " 00:00:00.000");
  }

  public formatDate(date: string) {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${month}/${day}/${year}`;
  }

  public parseDate(date: string) {
    if (!date) return "";
    const [month, day, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  public parseDateMMDDYYYY(date: string) {
    if (!date) return "";
    const [day, month, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
}
</script>
