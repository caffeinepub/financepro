import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type GoalCategory = {
    #shortTerm;
    #midTerm;
    #longTerm;
  };

  type InvestmentCategory = {
    #retirement;
    #realEstate;
    #equities;
    #fixedDeposits;
    #bonds;
    #commodities;
  };

  type InvestmentSubcategory = {
    #providentFund;
    #nps;
    #etf;
    #mutualFund;
    #crypto;
    #fd;
    #governmentBond;
    #gold;
    #stocks;
    #other : Text;
  };

  type FinancialGoal = {
    id : Nat;
    user : Principal;
    name : Text;
    targetAmount : Float;
    targetDate : Time.Time;
    createdDate : Time.Time;
    category : GoalCategory;
  };

  type Investment = {
    id : Nat;
    user : Principal;
    category : InvestmentCategory;
    subcategory : InvestmentSubcategory;
    investedAmount : Float;
    currentValue : Float;
    dateOfInvestment : Time.Time;
    createdDate : Time.Time;
  };

  type GoalInvestmentLink = {
    goalId : Nat;
    investmentId : Nat;
    amountAllocated : Float;
  };

  module GoalInvestmentLink {
    public func compare(a : GoalInvestmentLink, b : GoalInvestmentLink) : Order.Order {
      switch (Nat.compare(a.goalId, b.goalId)) {
        case (#equal) { Nat.compare(a.investmentId, b.investmentId) };
        case (order) { order };
      };
    };
  };

  type GoalProgressSummary = {
    goalId : Nat;
    goalName : Text;
    targetAmount : Float;
    currentAmount : Float;
    progressPercentage : Float;
    category : GoalCategory;
    targetDate : Time.Time;
  };

  type InvestmentSummary = {
    totalInvested : Float;
    currentPortfolioValue : Float;
    gainLossAbsolute : Float;
    pnlPercentage : Float;
  };

  type GoalCategoryBreakdown = {
    shortTermGoals : [GoalProgressSummary];
    midTermGoals : [GoalProgressSummary];
    longTermGoals : [GoalProgressSummary];
  };

  type GoalsAnalytics = {
    allGoals : [GoalProgressSummary];
    categoryBreakdown : GoalCategoryBreakdown;
    overallProgress : Float;
    totalGoalAmount : Float;
    totalAmountLinked : Float;
  };

  type InvestmentsAnalytics = {
    allInvestments : [Investment];
    summary : InvestmentSummary;
  };

  type FinancialDashboard = {
    goalsAnalytics : GoalsAnalytics;
    investmentsAnalytics : InvestmentsAnalytics;
  };

  public type UserProfile = {
    name : Text;
  };

  module FinancialGoal {
    public func compareByTargetDate(g1 : FinancialGoal, g2 : FinancialGoal) : Order.Order {
      Int.compare(g1.targetDate, g2.targetDate);
    };

    public func compareByTargetAmount(g1 : FinancialGoal, g2 : FinancialGoal) : Order.Order {
      Float.compare(g1.targetAmount, g2.targetAmount);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let financialGoals = Map.empty<Nat, FinancialGoal>();
  let investments = Map.empty<Nat, Investment>();
  let goalInvestmentLinks = Map.empty<Nat, Set.Set<GoalInvestmentLink>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var goalIdCounter = 0;
  var investmentIdCounter = 0;

  public shared ({ caller }) func ensureInitialized() : async () {
    if (caller.isAnonymous()) {
      return;
    };
    
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    switch (currentRole) {
      case (#user) { return };
      case (#admin) { return };
      case (#guest) {
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addFinancialGoal(
    name : Text,
    targetAmount : Float,
    targetDate : Time.Time,
    category : GoalCategory,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create financial goals");
    };
    let goalId = goalIdCounter;
    let goal : FinancialGoal = {
      id = goalId;
      user = caller;
      name;
      targetAmount;
      targetDate;
      createdDate = Time.now();
      category;
    };
    financialGoals.add(goalId, goal);
    goalIdCounter += 1;
    goalId;
  };

  public shared ({ caller }) func updateFinancialGoal(
    goalId : Nat,
    name : Text,
    targetAmount : Float,
    targetDate : Time.Time,
    category : GoalCategory,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update financial goals");
    };
    switch (financialGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) {
        if (goal.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own goals");
        };
        let updatedGoal : FinancialGoal = {
          id = goal.id;
          user = goal.user;
          name;
          targetAmount;
          targetDate;
          createdDate = goal.createdDate;
          category;
        };
        financialGoals.add(goalId, updatedGoal);
      };
    };
  };

  public shared ({ caller }) func deleteFinancialGoal(goalId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete financial goals");
    };
    switch (financialGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) {
        if (goal.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own goals");
        };
        financialGoals.remove(goalId);
        goalInvestmentLinks.remove(goalId);
      };
    };
  };

  public shared ({ caller }) func linkInvestmentToGoal(goalId : Nat, investmentId : Nat, amountAllocated : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link investments to goals");
    };

    switch (financialGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) {
        if (goal.user != caller) {
          Runtime.trap("Unauthorized: Can only link investments to your own goals");
        };
      };
    };

    switch (investments.get(investmentId)) {
      case (null) { Runtime.trap("Investment not found") };
      case (?investment) {
        if (investment.user != caller) {
          Runtime.trap("Unauthorized: Can only link your own investments");
        };
      };
    };

    let existingLinks = switch (goalInvestmentLinks.get(goalId)) {
      case (null) { Set.empty<GoalInvestmentLink>() };
      case (?links) { links };
    };
    let newLink : GoalInvestmentLink = {
      goalId;
      investmentId;
      amountAllocated;
    };
    existingLinks.add(newLink);
    goalInvestmentLinks.add(goalId, existingLinks);
  };

  public shared ({ caller }) func unlinkInvestmentFromGoal(goalId : Nat, investmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlink investments from goals");
    };

    switch (financialGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) {
        if (goal.user != caller) {
          Runtime.trap("Unauthorized: Can only unlink investments from your own goals");
        };
      };
    };

    switch (goalInvestmentLinks.get(goalId)) {
      case (null) { Runtime.trap("No links found for this goal") };
      case (?links) {
        let filteredLinks = Set.empty<GoalInvestmentLink>();
        for (link in links.values()) {
          if (link.investmentId != investmentId) {
            filteredLinks.add(link);
          };
        };
        goalInvestmentLinks.add(goalId, filteredLinks);
      };
    };
  };

  public shared ({ caller }) func addInvestment(
    category : InvestmentCategory,
    subcategory : InvestmentSubcategory,
    investedAmount : Float,
    currentValue : Float,
    dateOfInvestment : Time.Time,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add investments");
    };
    let investmentId = investmentIdCounter;
    let investment : Investment = {
      id = investmentId;
      user = caller;
      category;
      subcategory;
      investedAmount;
      currentValue;
      dateOfInvestment;
      createdDate = Time.now();
    };
    investments.add(investmentId, investment);
    investmentIdCounter += 1;
    investmentId;
  };

  public shared ({ caller }) func updateInvestment(
    investmentId : Nat,
    category : InvestmentCategory,
    subcategory : InvestmentSubcategory,
    investedAmount : Float,
    currentValue : Float,
    dateOfInvestment : Time.Time,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update investments");
    };
    switch (investments.get(investmentId)) {
      case (null) { Runtime.trap("Investment not found") };
      case (?investment) {
        if (investment.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own investments");
        };
        let updatedInvestment : Investment = {
          id = investment.id;
          user = investment.user;
          category;
          subcategory;
          investedAmount;
          currentValue;
          dateOfInvestment;
          createdDate = investment.createdDate;
        };
        investments.add(investmentId, updatedInvestment);
      };
    };
  };

  public shared ({ caller }) func deleteInvestment(investmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete investments");
    };
    switch (investments.get(investmentId)) {
      case (null) { Runtime.trap("Investment not found") };
      case (?investment) {
        if (investment.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own investments");
        };
        investments.remove(investmentId);
      };
    };
  };

  public query ({ caller }) func getFinancialGoal(goalId : Nat) : async FinancialGoal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view financial goals");
    };
    switch (financialGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) {
        if (goal.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own goals");
        };
        goal;
      };
    };
  };

  public query ({ caller }) func getInvestment(investmentId : Nat) : async Investment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investments");
    };
    switch (investments.get(investmentId)) {
      case (null) { Runtime.trap("Investment not found") };
      case (?investment) {
        if (investment.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own investments");
        };
        investment;
      };
    };
  };

  public query ({ caller }) func getUserFinancialGoals() : async [FinancialGoal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view financial goals");
    };
    financialGoals.values().toArray().filter(
      func(g) { g.user == caller }
    );
  };

  public query ({ caller }) func getUserInvestments() : async [Investment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investments");
    };
    investments.values().toArray().filter(
      func(i) { i.user == caller }
    );
  };

  public shared ({ caller }) func getGoalAnalytics() : async GoalsAnalytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goal analytics");
    };

    let callerGoals = financialGoals.values().toArray().filter(
      func(g) { g.user == caller }
    );

    let allGoals : [GoalProgressSummary] = callerGoals.map(
      func(goal) {
        {
          goalId = goal.id;
          goalName = goal.name;
          targetAmount = goal.targetAmount;
          currentAmount = computeLinkedAmount(goal.id);
          progressPercentage = computeProgressPercentage(goal.id);
          category = goal.category;
          targetDate = goal.targetDate;
        };
      }
    );

    let shortTermGoals = allGoals.filter(
      func(g) { g.category == #shortTerm }
    );
    let midTermGoals = allGoals.filter(
      func(g) { g.category == #midTerm }
    );
    let longTermGoals = allGoals.filter(
      func(g) { g.category == #longTerm }
    );

    let overallProgress = if (allGoals.size() == 0) {
      0.0;
    } else {
      let allProgresses = allGoals.map(func(g) { g.progressPercentage });
      let totalProgress = allProgresses.foldLeft(
        0.0,
        func(acc, p) { acc + p },
      );
      totalProgress / allGoals.size().toFloat();
    };

    {
      allGoals;
      categoryBreakdown = {
        shortTermGoals;
        midTermGoals;
        longTermGoals;
      };
      overallProgress;
      totalGoalAmount = calculateTotalAmount(allGoals, bucketGoalTargetAmounts);
      totalAmountLinked = calculateTotalAmount(allGoals, bucketGoalCurrentAmounts);
    };
  };

  func bucketGoalTargetAmounts(goal : GoalProgressSummary) : Float {
    goal.targetAmount;
  };

  func bucketGoalCurrentAmounts(goal : GoalProgressSummary) : Float {
    goal.currentAmount;
  };

  func calculateTotalAmount(goals : [GoalProgressSummary], getter : (GoalProgressSummary) -> Float) : Float {
    let amounts = goals.map(getter);
    amounts.foldLeft(0.0, func(acc, amount) { acc + amount });
  };

  public shared ({ caller }) func getInvestmentAnalytics() : async InvestmentsAnalytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investment analytics");
    };

    let callerInvestments = investments.values().toArray().filter(
      func(i) { i.user == caller }
    );

    let allInvestedAmounts = callerInvestments.map(func(i) { i.investedAmount });
    let totalInvested = allInvestedAmounts.foldLeft(
      0.0,
      func(acc, a) { acc + a },
    );

    let allCurrentValues = callerInvestments.map(func(i) { i.currentValue });
    let currentPortfolioValue = allCurrentValues.foldLeft(
      0.0,
      func(acc, v) { acc + v },
    );

    let gainLossAbsolute = currentPortfolioValue - totalInvested;

    let pnlPercentage = if (totalInvested == 0.0) {
      0.0;
    } else {
      (gainLossAbsolute / totalInvested) * 100.0;
    };

    let summary : InvestmentSummary = {
      totalInvested;
      currentPortfolioValue;
      gainLossAbsolute;
      pnlPercentage;
    };

    {
      allInvestments = callerInvestments;
      summary;
    };
  };

  func computeLinkedAmount(goalId : Nat) : Float {
    switch (goalInvestmentLinks.get(goalId)) {
      case (null) { 0.0 };
      case (?links) {
        let iter = links.values();
        let linkArray = iter.toArray();
        let amounts = linkArray.map(func(link) { link.amountAllocated });
        amounts.foldLeft(
          0.0,
          func(acc, a) { acc + a },
        );
      };
    };
  };

  func computeProgressPercentage(goalId : Nat) : Float {
    switch (financialGoals.get(goalId)) {
      case (null) { 0.0 };
      case (?goal) {
        if (goal.targetAmount == 0.0) {
          return 100.0;
        };
        let linkedAmount = computeLinkedAmount(goalId);
        let percentage = (linkedAmount / goal.targetAmount) * 100.0;
        if (percentage > 100.0) { 100.0 } else { percentage };
      };
    };
  };

  public shared ({ caller }) func getDashboard() : async FinancialDashboard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };

    let goalsAnalytics = await getGoalAnalytics();
    let investmentsAnalytics = await getInvestmentAnalytics();
    {
      goalsAnalytics;
      investmentsAnalytics;
    };
  };
};
