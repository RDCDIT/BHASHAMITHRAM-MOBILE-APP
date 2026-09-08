class MigrationReporter {
  constructor() {
    this.stats = {};
  }

  startTable(tableName) {
    this.stats[tableName] = {
      tableName,
      read: 0,
      inserted: 0,
      failed: 0,
      startTime: Date.now(),
      endTime: null,
      errors: []
    };
  }

  incrementRead(tableName, count = 1) {
    if (this.stats[tableName]) {
      this.stats[tableName].read += count;
    }
  }

  incrementInserted(tableName, count = 1) {
    if (this.stats[tableName]) {
      this.stats[tableName].inserted += count;
    }
  }

  incrementFailed(tableName, count = 1) {
    if (this.stats[tableName]) {
      this.stats[tableName].failed += count;
    }
  }

  addError(tableName, error) {
    if (this.stats[tableName]) {
      this.stats[tableName].errors.push(error.message || String(error));
    }
  }

  endTable(tableName) {
    if (this.stats[tableName]) {
      this.stats[tableName].endTime = Date.now();
    }
  }

  generateSummary() {
    const summary = [];
    let totalRead = 0;
    let totalInserted = 0;
    let totalFailed = 0;
    const statsList = Object.values(this.stats);
    
    if (statsList.length === 0) {
      console.log('No tables were processed during the migration.');
      return;
    }

    const overallStartTime = statsList.reduce((min, s) => Math.min(min, s.startTime), Date.now());
    const overallEndTime = statsList.reduce((max, s) => Math.max(max, s.endTime || Date.now()), Date.now());
    const overallDuration = overallEndTime - overallStartTime;

    console.log('\n=========================================');
    console.log('       DICT MIGRATION RUN REPORT');
    console.log('=========================================');

    for (const [name, data] of Object.entries(this.stats)) {
      const duration = data.endTime ? ((data.endTime - data.startTime) / 1000).toFixed(2) : 'N/A';
      totalRead += data.read;
      totalInserted += data.inserted;
      totalFailed += data.failed;

      console.log(`\nTable: ${name}`);
      console.log(`- Total Records Read: ${data.read}`);
      console.log(`- Records Inserted:   ${data.inserted}`);
      console.log(`- Records Failed:     ${data.failed}`);
      console.log(`- Execution Time:     ${duration} seconds`);
      if (data.errors.length > 0) {
        console.log(`- Errors Encountered (showing up to 5):`);
        data.errors.slice(0, 5).forEach((err, i) => console.log(`  [${i+1}] ${err}`));
      }
      
      summary.push({
        Table: name,
        'Read': data.read,
        'Inserted': data.inserted,
        'Failed': data.failed,
        'Duration (s)': duration
      });
    }

    console.log('\n=========================================');
    console.log('            OVERALL SUMMARY');
    console.log('=========================================');
    console.table(summary);
    console.log(`Total Tables Processed: ${Object.keys(this.stats).length}`);
    console.log(`Total Records Read:     ${totalRead}`);
    console.log(`Total Records Inserted: ${totalInserted}`);
    console.log(`Total Records Failed:   ${totalFailed}`);
    console.log(`Total Execution Time:   ${(overallDuration / 1000).toFixed(2)} seconds`);
    console.log('=========================================\n');
  }
}

module.exports = MigrationReporter;
