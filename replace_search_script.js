const fs = require('fs');
let content = fs.readFileSync('src/app/admin/finance/page.tsx', 'utf8');

// 1. STATE ADDITION
const oldStateRegex = /  \/\/ Validation States[\s\S]*?const \[isBookingValid, setIsBookingValid\] = useState\(false\);/;
const newState = `  // Search and Validation States
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);`;

content = content.replace(oldStateRegex, newState);

// 2. SEARCH FUNCTION & DEBOUNCE (replaces validateBooking and old debounce)
const oldValidateBlockRegex = /  const validateBooking = async \(input: string\) => \{[\s\S]*?return \(\) => clearTimeout\(timer\);\n  \}, \[formData\.reference_number, editingReferenceNumber\]\);/;

const newSearchBlock = `  const searchBookings = async (value: string) => {
    try {
      if (!value) {
        setResults([]);
        return;
      }

      setLoadingSearch(true);
      const clean = value.trim();

      const { data, error } = await supabase
        .from("bookings")
        .select(\`
          reference_number,
          customer_name,
          customer_email,
          full_name
        \`)
        .or(\`reference_number.ilike.%\${clean}%,customer_email.ilike.%\${clean}%,customer_name.ilike.%\${clean}%\`)
        .limit(10);

      if (error) {
        console.error("Search error:", error);
        return;
      }

      setResults(data || []);
    } catch (err) {
      console.error("Search crash:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchBookings(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);`;

content = content.replace(oldValidateBlockRegex, newSearchBlock);

// 3. Update FORM VALIDATION in handleAddOrEditInvoice
content = content.replace(
  /if \(\!isBookingValid\) \{\s+toast\.error\("Booking not found"\);\s+return;\s+\}/,
  `if (!selectedBooking && !editingReferenceNumber) {
      toast.error("Please select a booking from the dropdown");
      return;
    }`
);
content = content.replace(/console\.log\("BOOKING DATA:", isBookingValid\);/, 'console.log("BOOKING DATA:", selectedBooking);');

// 4. Update UI REPLACEMENT for the input field
const oldUIRegex = /<div className="space-y-1\.5">\s+<label className="text-xs font-bold text-white\/70 uppercase flex justify-between items-center">[\s\S]*?<div className="grid grid-cols-2 gap-4">/;

const newUI = `<div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-white/70 uppercase flex justify-between items-center">
                  <span>REFERENCE NUMBER <span className="text-red-500">*</span></span>
                  {loadingSearch && <Loader2 className="h-3 w-3 animate-spin text-white/50" />}
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input 
                      required
                      type="text" 
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setFormData({...formData, reference_number: e.target.value});
                        if (!e.target.value) setSelectedBooking(null);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-mono"
                      placeholder="Search by reference, email or name"
                    />
                  </div>

                  {results.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                      {results.map((item) => (
                        <div
                          key={item.reference_number}
                          onClick={() => {
                            setSelectedBooking(item);
                            setSearch(item.reference_number);

                            setFormData(prev => ({
                              ...prev,
                              reference_number: item.reference_number,
                              customer_name: item.customer_name || item.full_name || "",
                              customer_email: item.customer_email || ""
                            }));

                            setResults([]);
                          }}
                          className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-[#00ff9d] font-mono text-sm">{item.reference_number}</strong>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                            <User className="h-3 w-3" />
                            <span className="truncate">{item.customer_name || item.full_name || "Unknown"}</span>
                            <span className="text-white/20">•</span>
                            <span className="truncate">{item.customer_email || "No Email"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedBooking && <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Booking Selected</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">`;

content = content.replace(oldUIRegex, newUI);

// Fix resetForm to reset search states
content = content.replace(/setIsBookingValid\(false\);\s+setBookingError\(null\);/g, 'setSearch("");\n    setResults([]);\n    setSelectedBooking(null);');

// Fix handleEditInit to populate search state
content = content.replace(/setEditingReferenceNumber\(inv\.reference_number\);/g, 'setEditingReferenceNumber(inv.reference_number);\n    setSearch(inv.reference_number || "");');

// Fix submit button disabled state
content = content.replace(/disabled=\{isSubmitting \|\| \!isBookingValid\}/g, 'disabled={isSubmitting || (!selectedBooking && !editingReferenceNumber)}');

fs.writeFileSync('src/app/admin/finance/page.tsx', content);
