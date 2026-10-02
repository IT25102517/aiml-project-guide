export interface VivaQA {
  question: string;
  answer: string;
}

export interface Step {
  stepNumber: number;
  title: string;
  code: string;
  approach: string;           
  whatToLookFor: string[];    
  technicalNotes: string;     
  commonMistakes: string[];   
  screenshotInstructions: string; 
}

export interface ModelData {
  modelId: string;
  modelName: string;
  modelDescription: string;
  algorithmType: string;      
  memberId: string;
  memberName: string;
  studentId: string;
  steps: Step[];
  vivaQuestions: VivaQA[];
}

export interface MemberInfo {
  memberId: string;
  memberName: string;
  studentId: string;
  modelId: string;
  modelName: string;
}

export const members: MemberInfo[] = [
  { memberId: 'amarasekara', memberName: 'Amarasekara I.S.Y.', studentId: 'IT25101702', modelId: 'ridge', modelName: 'Ridge Regression' },
  { memberId: 'indusara', memberName: 'Indusara L.G.S.', studentId: 'IT25102517', modelId: 'gradient_boosting', modelName: 'Gradient Boosting' },
  { memberId: 'gunathilake', memberName: 'Gunathilake P.G.K.I.', studentId: 'IT25103600', modelId: 'random_forest', modelName: 'Random Forest' },
  { memberId: 'wijerathna', memberName: 'Wijerathna K.G.C.J.', studentId: 'IT25101522', modelId: 'decision_tree', modelName: 'Decision Tree' },
  { memberId: 'bandara', memberName: 'Bandara U.S.B.N.', studentId: 'IT25103405', modelId: 'svr', modelName: 'Support Vector Regression (SVR)' },
  { memberId: 'wijesinghe', memberName: 'Wijesinghe W.A.D.M.C.L.', studentId: 'IT25100607', modelId: 'knn', modelName: 'K-Nearest Neighbors (KNN)' }
];

export const models: ModelData[] = [
  {
    modelId: 'ridge',
    modelName: 'Ridge Regression',
    modelDescription: 'A linear model that uses L2 regularization to prevent overfitting by adding a penalty to the size of coefficients.',
    algorithmType: 'Linear (Regularized)',
    memberId: 'amarasekara',
    memberName: 'Amarasekara I.S.Y.',
    studentId: 'IT25101702',
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Data Loading',
        code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Load data
df = pd.read_csv('final_processed_cars.csv')

# Separate features (X) and target (y)
# We predict Log_Price, not Price
X = df.drop(columns=['Price', 'Log_Price'])
y = df['Log_Price']

# Split into 80% training and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")`,
        approach: 'In this step, we prepare our working environment by importing essential libraries for data manipulation, modeling, and evaluation. We load our preprocessed dataset which contains car attributes like Kilometers_Driven, Mileage, Engine capacity, and categorical data like Fuel Type.\n\nCrucially, we separate our data into features (X) and our target (y). We use "Log_Price" instead of "Price". Used car prices are often "right-skewed" (a few very expensive luxury cars stretch the distribution). Taking the logarithm makes the data look more like a normal bell curve, which linear models prefer. Finally, we split the data: 80% to train the model, 20% kept unseen to test it fairly.',
        whatToLookFor: [
          'Training shape should be approximately (4779, 12)',
          'Testing shape should be approximately (1195, 12)'
        ],
        technicalNotes: 'The train_test_split function randomly samples the data. Setting `random_state=42` sets a seed for this randomness. It ensures that every time you run this code, you get the exact same split. If we did not use a random state, our model metrics would change slightly on every run because it would be trained on slightly different data.',
        commonMistakes: [
          'If you see KeyError for Log_Price, make sure you uploaded the correct final_processed_cars.csv',
          'Do NOT use Price as target - we use Log_Price because the price distribution is right-skewed'
        ],
        screenshotInstructions: 'Screenshot the cell output showing both training and testing data shapes'
      },
      {
        stepNumber: 2,
        title: 'Base Model Training',
        code: `# Initialize Ridge Regression with default parameters
base_model = Ridge(random_state=42)

# Train the model on the training data
base_model.fit(X_train, y_train)

# Make predictions on the test data (these are in log scale)
y_pred_log = base_model.predict(X_test)

# Convert predictions and actuals back from log scale to actual Rupee values
y_pred_actual = np.expm1(y_pred_log)
y_test_actual = np.expm1(y_test)

# Calculate metrics
mae = mean_absolute_error(y_test_actual, y_pred_actual)
rmse = root_mean_squared_error(y_test_actual, y_pred_actual)
r2 = r2_score(y_test_actual, y_pred_actual)

print("--- Base Model Evaluation ---")
print(f"MAE: ₹{mae:.2f} Lakhs")
print(f"RMSE: ₹{rmse:.2f} Lakhs")
print(f"R2 Score: {r2:.4f}")`,
        approach: 'We train a standard Ridge model as our "baseline". This gives us a benchmark to see if our later tuning actually improves anything. We feed `X_train` and `y_train` into the `.fit()` method, which tells the model to figure out the relationship (the mathematical formula) connecting car features to log prices.\n\nThen, we ask the model to predict prices for `X_test`. Since our model outputs log prices, we must use `np.expm1()` (exponential minus 1) to convert them back to normal Rupee values before we calculate errors. If we did not convert back, our error would look incredibly small (e.g., off by 0.5), but that would be log-error, not Rupee-error.',
        whatToLookFor: [
          'MAE should be around 2-4 Lakhs',
          'R2 should be around 0.65-0.75'
        ],
        technicalNotes: 'Standard Linear Regression tries to draw a line that minimizes the distance to all data points. However, if features are correlated, it can assign wildly large positive and negative weights (coefficients) to them, causing overfitting (memorizing the training data). Ridge (L2 Regularization) adds a penalty mathematically: it tells the model "minimize the error, BUT also keep the coefficients as small as possible." This acts as a dampener, making the model smoother and more robust on unseen data.',
        commonMistakes: [
          'Forgetting np.expm1() will result in meaningless metrics (an MAE of 0.3 means nothing in rupees).',
          'Evaluating against y_test (log scale) instead of y_test_actual.'
        ],
        screenshotInstructions: 'Screenshot showing all 3 metrics (MAE, RMSE, R2)'
      },
      {
        stepNumber: 3,
        title: 'Hyperparameter Tuning with GridSearchCV',
        code: `from sklearn.model_selection import GridSearchCV, KFold

# Define the parameters we want to test
# alpha controls the strength of the regularization penalty
param_grid = {
    'alpha': [0.1, 1.0, 10.0, 50.0, 100.0, 200.0]
}

# Setup 5-fold cross validation
kf = KFold(n_splits=5, shuffle=True, random_state=42)

# Initialize GridSearchCV
grid_search = GridSearchCV(
    estimator=Ridge(random_state=42),
    param_grid=param_grid,
    cv=kf,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
)

print("Starting Grid Search... testing different alpha values")
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"Best Parameters Found: {grid_search.best_params_}")`,
        approach: 'Algorithms have settings called "hyperparameters" that act like tuning knobs. For Ridge, the main knob is `alpha`, which controls how strictly it penalizes large coefficients. A small alpha is like standard linear regression; a huge alpha forces all coefficients close to zero. We don\'t know which is best for our data.\n\nGridSearchCV tests a list of alphas we provide. It uses Cross-Validation (KFold). Imagine cutting the training data into 5 slices. It trains on 4 slices and tests on the 1 remaining slice, rotating until every slice has been the test set. It does this for EVERY alpha value to reliably find the best one without ever looking at our final `X_test` data.',
        whatToLookFor: [
          'Note down the Best Parameters Found output - you will need these for the viva'
        ],
        technicalNotes: '`scoring="neg_mean_absolute_error"` looks weird. Scikit-learn\'s GridSearch always tries to *maximize* the scoring metric. Since we want to *minimize* error, scikit-learn uses negative error. So an MAE of 2 becomes -2. Maximizing -2 vs -5 correctly picks -2 (the smaller error). `n_jobs=-1` tells the computer to use all available processor cores to speed up the search.',
        commonMistakes: [
          'GridSearchCV can take time - do not interrupt the cell while it runs.'
        ],
        screenshotInstructions: 'Screenshot showing the Best Parameters Found output'
      },
      {
        stepNumber: 4,
        title: 'Final Evaluation',
        code: `# Predict with the best tuned model
y_pred_tuned_log = best_model.predict(X_test)
y_pred_tuned_actual = np.expm1(y_pred_tuned_log)

# Calculate final metrics
final_mae = mean_absolute_error(y_test_actual, y_pred_tuned_actual)
final_rmse = root_mean_squared_error(y_test_actual, y_pred_tuned_actual)
final_r2 = r2_score(y_test_actual, y_pred_tuned_actual)

print("--- Tuned Ridge Model Evaluation ---")
print(f"MAE: ₹{final_mae:.2f} Lakhs")
print(f"RMSE: ₹{final_rmse:.2f} Lakhs")
print(f"R2 Score: {final_r2:.4f}")

print("\\n--- Feature Importance (Coefficients) ---")
# Get coefficients
coeffs = pd.DataFrame({
    'Feature': X.columns,
    'Coefficient': best_model.coef_
})
# Sort by absolute magnitude to find most impactful features
coeffs['Absolute_Coeff'] = coeffs['Coefficient'].abs()
top_features = coeffs.sort_values(by='Absolute_Coeff', ascending=False).head(5)
print(top_features[['Feature', 'Coefficient']])`,
        approach: 'Now we use the absolute best version of our model found in Step 3 and test it one final time on `X_test`. We calculate the MAE, RMSE, and R2 just like in Step 2 to see how much our tuning helped.\n\nAdditionally, because Ridge is a linear model, we can look inside its "brain" by checking the coefficients. A coefficient tells us the weight the model gives to a feature. A positive coefficient means as the feature increases, price increases. A negative coefficient means as the feature increases, price drops. We sort them by absolute size to find the top drivers of car price.',
        whatToLookFor: [
          'Compare these numbers with your Step 2 base model - they should be slightly better or identical if default was optimal',
          'Note the top 3 features (usually Car_Age, Power_bhp, or Engine_cc)'
        ],
        technicalNotes: 'MAE (Mean Absolute Error) of 1.5 means on average, our prediction is off by ₹1.5 Lakhs. RMSE (Root Mean Squared Error) heavily punishes huge errors. If MAE is small but RMSE is very large, it means most predictions are good, but a few are wildly wrong. R2 (R-Squared) measures the percentage of variance explained. An R2 of 0.80 means 80% of the fluctuation in car prices is explained by our features.',
        commonMistakes: [
          'Interpreting coefficients directly as rupee amounts. Because our target is log(Price), a coefficient of 0.1 means an approximate 10% increase in price, not 0.1 Lakhs.'
        ],
        screenshotInstructions: 'Screenshot showing the tuned model metrics AND the top 3 features'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why did you choose Ridge Regression for this used car dataset?',
        answer: 'Used car datasets often have correlated features, like Engine_cc and Power_bhp (a bigger engine usually has more power). Standard linear regression can become unstable with correlated features. Ridge regression handles this well by adding a regularization penalty (L2) that shrinks coefficients, making the model more stable and less prone to overfitting.'
      },
      {
        question: 'How does Ridge Regression work internally compared to simple Linear Regression?',
        answer: 'Simple Linear Regression minimizes the Sum of Squared Errors to find the best fit line. Ridge does the same but adds a penalty term: the squared magnitude of the coefficients multiplied by a parameter alpha. This forces the algorithm to keep the weights small, resulting in a smoother, less overfitted model.'
      },
      {
        question: 'What is the "alpha" parameter in Ridge Regression and how did you tune it?',
        answer: 'Alpha controls the strength of the penalty. If alpha is 0, it acts exactly like simple linear regression. As alpha increases, coefficients shrink closer to zero. I used GridSearchCV to test values from 0.1 to 200 using 5-fold Cross Validation to find the optimal balance between underfitting and overfitting.'
      },
      {
        question: 'Explain what MAE, RMSE, and R2 mean in the context of car prices.',
        answer: 'MAE is the average absolute difference between predicted and actual prices; for example, an MAE of 1.5 means predictions are off by 1.5 Lakhs on average. RMSE gives higher weight to large errors, highlighting if we have occasional huge mistakes. R2 is the percentage of variance explained; an R2 of 0.75 means our features explain 75% of why car prices vary.'
      },
      {
        question: 'Why did you train the model on Log_Price instead of normal Price?',
        answer: 'Car prices are highly right-skewed—most cars are affordable, but a few are extremely expensive luxury cars. Linear models struggle with skewed targets. By predicting the natural log of the price, the target variable becomes more normally distributed. We use np.expm1() to convert predictions back to Rupee Lakhs before calculating error metrics.'
      }
    ]
  },
  {
    modelId: 'gradient_boosting',
    modelName: 'Gradient Boosting',
    modelDescription: 'An ensemble method that builds decision trees sequentially, where each new tree tries to correct the errors made by the previous trees.',
    algorithmType: 'Ensemble (Boosting)',
    memberId: 'indusara',
    memberName: 'Indusara L.G.S.',
    studentId: 'IT25102517',
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Data Loading',
        code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Load data
df = pd.read_csv('final_processed_cars.csv')

# Separate features (X) and target (y)
X = df.drop(columns=['Price', 'Log_Price'])
y = df['Log_Price']

# Split into 80% training and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")`,
        approach: 'In this step, we prepare our working environment by importing essential libraries for data manipulation, modeling, and evaluation. We load our preprocessed dataset which contains car attributes.\n\nWe separate our data into features (X) and target (y). We use "Log_Price" instead of "Price" because reducing skewness helps Gradient Boosting converge faster and yield better residuals. Finally, we split the data: 80% to train the model, 20% kept strictly unseen to test it later.',
        whatToLookFor: [
          'Training shape should be approximately (4779, 12)',
          'Testing shape should be approximately (1195, 12)'
        ],
        technicalNotes: 'The train_test_split function randomly splits data. Setting `random_state=42` ensures reproducibility. The 80/20 split is a standard Pareto principle split ensuring enough data to learn patterns (80) but enough unseen data to validate generalized performance (20).',
        commonMistakes: [
          'If you see KeyError for Log_Price, make sure you uploaded the correct final_processed_cars.csv',
          'Do NOT use Price as target - always use Log_Price'
        ],
        screenshotInstructions: 'Screenshot the cell output showing both training and testing data shapes'
      },
      {
        stepNumber: 2,
        title: 'Base Model Training',
        code: `# Initialize Gradient Boosting with default parameters
base_model = GradientBoostingRegressor(random_state=42)

# Train the model
base_model.fit(X_train, y_train)

# Predict and convert back from log scale
y_pred_log = base_model.predict(X_test)
y_pred_actual = np.expm1(y_pred_log)
y_test_actual = np.expm1(y_test)

# Calculate metrics
mae = mean_absolute_error(y_test_actual, y_pred_actual)
rmse = root_mean_squared_error(y_test_actual, y_pred_actual)
r2 = r2_score(y_test_actual, y_pred_actual)

print("--- Base Model Evaluation ---")
print(f"MAE: ₹{mae:.2f} Lakhs")
print(f"RMSE: ₹{rmse:.2f} Lakhs")
print(f"R2 Score: {r2:.4f}")`,
        approach: 'We train a standard Gradient Boosting model as our baseline. `fit()` trains the model. Then we predict on the test set. Because the model predicts log values, we use `np.expm1()` to reverse the transformation back to normal Lakhs before calculating how wrong we are (MAE/RMSE).',
        whatToLookFor: [
          'MAE should be around 1.5 - 2.5 Lakhs',
          'R2 should be around 0.85-0.90'
        ],
        technicalNotes: 'Gradient Boosting works by building weak Decision Trees one after another. Tree 1 makes a rough prediction. We calculate its errors (residuals). Tree 2 is then trained *specifically* to predict and fix the errors of Tree 1. Tree 3 fixes the errors of Tree 2, and so on. They combine to make a very strong model.',
        commonMistakes: [
          'Forgetting np.expm1() will result in meaningless log-scale errors.'
        ],
        screenshotInstructions: 'Screenshot showing all 3 metrics (MAE, RMSE, R2)'
      },
      {
        stepNumber: 3,
        title: 'Hyperparameter Tuning with GridSearchCV',
        code: `from sklearn.model_selection import GridSearchCV, KFold

# Parameter grid
param_grid = {
    'n_estimators': [100, 200],
    'learning_rate': [0.05, 0.1, 0.2],
    'max_depth': [3, 5, 7]
}

# 3-fold cross validation for speed
kf = KFold(n_splits=3, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    estimator=GradientBoostingRegressor(random_state=42),
    param_grid=param_grid,
    cv=kf,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
)

print("Starting Grid Search... testing trees, depth, and learning rate")
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"Best Parameters Found: {grid_search.best_params_}")`,
        approach: 'Gradient Boosting has many settings. `n_estimators` is how many trees to build. `learning_rate` dictates how big of a step each tree takes to correct the error. `max_depth` restricts how deep each tree can grow. GridSearchCV tests combinations of these to find the optimal setup, using 3-Fold Cross Validation.',
        whatToLookFor: [
          'Note down the Best Parameters Found output - you will need these for the viva'
        ],
        technicalNotes: 'There is a known tradeoff between learning_rate and n_estimators. A smaller learning rate means each tree does less work, so you need MORE trees (n_estimators) to learn the pattern. Using CV=3 instead of 5 speeds up the grid search, which is necessary since Gradient Boosting builds sequentially and cannot easily parallelize building a single model.',
        commonMistakes: [
          'GridSearchCV for Gradient Boosting takes time because trees are built sequentially. Do not interrupt.'
        ],
        screenshotInstructions: 'Screenshot showing the Best Parameters Found output'
      },
      {
        stepNumber: 4,
        title: 'Final Evaluation',
        code: `# Predict with best model
y_pred_tuned_log = best_model.predict(X_test)
y_pred_tuned_actual = np.expm1(y_pred_tuned_log)

# Metrics
final_mae = mean_absolute_error(y_test_actual, y_pred_tuned_actual)
final_rmse = root_mean_squared_error(y_test_actual, y_pred_tuned_actual)
final_r2 = r2_score(y_test_actual, y_pred_tuned_actual)

print("--- Tuned Gradient Boosting Evaluation ---")
print(f"MAE: ₹{final_mae:.2f} Lakhs")
print(f"RMSE: ₹{final_rmse:.2f} Lakhs")
print(f"R2 Score: {final_r2:.4f}")

print("\\n--- Feature Importance ---")
# Get feature importances
importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': best_model.feature_importances_
})
# Sort highest to lowest
top_features = importance.sort_values(by='Importance', ascending=False).head(5)
print(top_features)`,
        approach: 'We evaluate the optimized model on the test data. Gradient Boosting also allows us to extract "Feature Importance." Unlike linear coefficients which can be negative, tree-based importance is a percentage (0 to 1) representing how often a feature was used to make a split across all trees, and how much those splits reduced the error.',
        whatToLookFor: [
          'Compare these numbers with your Step 2 base model - they should be better',
          'Note the top 3 features (often Power_bhp or Car_Age)'
        ],
        technicalNotes: 'Feature importance in scikit-learn is "Gini importance" or Mean Decrease Impurity. It measures how much a feature decreased the variance across all trees. If Power_bhp has an importance of 0.40, it implies 40% of the model\'s decision-making power relies on that single feature.',
        commonMistakes: [
          'Always compare tuned metrics with your base model to verify improvement'
        ],
        screenshotInstructions: 'Screenshot showing the tuned model metrics AND the top 3 features'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why did you choose Gradient Boosting for this dataset?',
        answer: 'Gradient Boosting is highly effective for tabular data like used cars because it can capture complex, non-linear relationships without needing manual feature engineering. It sequentially minimizes errors, often achieving higher accuracy than basic tree or linear models.'
      },
      {
        question: 'How does Gradient Boosting work internally?',
        answer: 'It is an ensemble "boosting" method. It builds decision trees one at a time. The first tree makes a prediction. The model calculates the residuals (errors) of that prediction. The next tree is then trained not to predict the price, but to predict the *error* of the first tree. This process repeats, with each new tree trying to fix the mistakes of the combined previous trees.'
      },
      {
        question: 'What parameters did you tune in GridSearchCV?',
        answer: 'I tuned n_estimators (number of trees), max_depth (how deep each tree can grow, controlling complexity), and learning_rate (how aggressively each tree tries to correct errors). Finding the balance between learning rate and number of trees is crucial to prevent overfitting.'
      },
      {
        question: 'What is the relationship between learning_rate and n_estimators?',
        answer: 'They are inversely related. A smaller learning rate means each tree makes a very tiny correction. Therefore, if you use a small learning rate, you need a larger number of estimators (trees) to achieve the same overall learning progress. A smaller learning rate usually generalizes better but takes longer to train.'
      },
      {
        question: 'How do you interpret the Feature Importance output?',
        answer: 'Feature importance tells us which variables were most useful in predicting price. It is calculated by looking at how much each feature reduced the variance when used to split data in the trees. The values sum to 1.0 (or 100%), so a feature with 0.45 importance holds 45% of the predictive power.'
      }
    ]
  },
  {
    modelId: 'random_forest',
    modelName: 'Random Forest',
    modelDescription: 'An ensemble method that builds hundreds of independent decision trees on random subsets of data and averages their predictions.',
    algorithmType: 'Ensemble (Bagging)',
    memberId: 'gunathilake',
    memberName: 'Gunathilake P.G.K.I.',
    studentId: 'IT25103600',
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Data Loading',
        code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Load data
df = pd.read_csv('final_processed_cars.csv')

# Separate features (X) and target (y)
X = df.drop(columns=['Price', 'Log_Price'])
y = df['Log_Price']

# Split into 80% training and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")`,
        approach: 'We prepare the environment by importing libraries. We separate our independent variables (X) from the dependent variable (y). Using Log_Price helps Random Forest by compressing extreme outlier prices, making the splits at the bottom of the trees more generalized. We split 80% for training and 20% for final testing.',
        whatToLookFor: [
          'Training shape should be approximately (4779, 12)',
          'Testing shape should be approximately (1195, 12)'
        ],
        technicalNotes: 'The train_test_split ensures our model evaluation is fair. A model can easily memorize the training data (overfitting), so we must test it on data it has never seen (X_test). Random_state=42 ensures the random split is identical every time the code runs.',
        commonMistakes: [
          'If you see KeyError for Log_Price, make sure you uploaded the correct final_processed_cars.csv',
          'Do NOT use Price as target - we use Log_Price'
        ],
        screenshotInstructions: 'Screenshot the cell output showing both training and testing data shapes'
      },
      {
        stepNumber: 2,
        title: 'Base Model Training',
        code: `# Initialize Random Forest with default parameters
# n_jobs=-1 uses all CPU cores for faster training
base_model = RandomForestRegressor(random_state=42, n_jobs=-1)

# Train the model
base_model.fit(X_train, y_train)

# Predict and convert back from log scale
y_pred_log = base_model.predict(X_test)
y_pred_actual = np.expm1(y_pred_log)
y_test_actual = np.expm1(y_test)

# Calculate metrics
mae = mean_absolute_error(y_test_actual, y_pred_actual)
rmse = root_mean_squared_error(y_test_actual, y_pred_actual)
r2 = r2_score(y_test_actual, y_pred_actual)

print("--- Base Model Evaluation ---")
print(f"MAE: ₹{mae:.2f} Lakhs")
print(f"RMSE: ₹{rmse:.2f} Lakhs")
print(f"R2 Score: {r2:.4f}")`,
        approach: 'We train a baseline Random Forest. Because Random Forest builds hundreds of trees independently, we can use `n_jobs=-1` to tell Python to build them simultaneously using all CPU cores. We fit the model, predict on the test set, and transform the log predictions back to real Lakhs using `np.expm1()` before checking MAE/RMSE metrics.',
        whatToLookFor: [
          'MAE should be around 1.5 - 2.5 Lakhs',
          'R2 should be around 0.85-0.90'
        ],
        technicalNotes: 'Random Forest works on the principle of "Bagging" (Bootstrap Aggregating). It creates many Decision Trees. However, each tree only gets a random sample of the training rows (Bootstrap) AND a random subset of features to look at. This randomness ensures the trees are different from each other. The final prediction is the average of all trees.',
        commonMistakes: [
          'Forgetting np.expm1() will result in meaningless log-scale metrics.'
        ],
        screenshotInstructions: 'Screenshot showing all 3 metrics (MAE, RMSE, R2)'
      },
      {
        stepNumber: 3,
        title: 'Hyperparameter Tuning with GridSearchCV',
        code: `from sklearn.model_selection import GridSearchCV, KFold

# Parameter grid
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [None, 10, 15],
    'min_samples_split': [2, 5]
}

# 3-fold cross validation for speed
kf = KFold(n_splits=3, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    estimator=RandomForestRegressor(random_state=42, n_jobs=-1),
    param_grid=param_grid,
    cv=kf,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
)

print("Starting Grid Search... this will build hundreds of forests")
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"Best Parameters Found: {grid_search.best_params_}")`,
        approach: 'We tune the forest. `n_estimators` is the number of trees (a bigger forest is generally better but slower). `max_depth` limits tree growth so they don\'t memorize noise. `min_samples_split` dictates the minimum number of data rows needed in a node before it is allowed to split again. GridSearchCV evaluates combinations using 3-Fold Cross Validation.',
        whatToLookFor: [
          'Note down the Best Parameters Found output - you will need these for the viva'
        ],
        technicalNotes: 'Using `n_jobs=-1` inside both the Estimator and GridSearchCV means maximum CPU usage. Note that unlike Gradient Boosting where more trees can eventually cause overfitting, adding more `n_estimators` in Random Forest rarely overfits (it just averages out more), but it heavily increases computation time.',
        commonMistakes: [
          'GridSearchCV for Random Forest can be very memory and CPU intensive. Do not close the browser or interrupt.'
        ],
        screenshotInstructions: 'Screenshot showing the Best Parameters Found output'
      },
      {
        stepNumber: 4,
        title: 'Final Evaluation',
        code: `# Predict with best model
y_pred_tuned_log = best_model.predict(X_test)
y_pred_tuned_actual = np.expm1(y_pred_tuned_log)

# Metrics
final_mae = mean_absolute_error(y_test_actual, y_pred_tuned_actual)
final_rmse = root_mean_squared_error(y_test_actual, y_pred_tuned_actual)
final_r2 = r2_score(y_test_actual, y_pred_tuned_actual)

print("--- Tuned Random Forest Evaluation ---")
print(f"MAE: ₹{final_mae:.2f} Lakhs")
print(f"RMSE: ₹{final_rmse:.2f} Lakhs")
print(f"R2 Score: {final_r2:.4f}")

print("\\n--- Feature Importance ---")
importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': best_model.feature_importances_
})
top_features = importance.sort_values(by='Importance', ascending=False).head(5)
print(top_features)`,
        approach: 'We do a final prediction test with our tuned forest. We also extract feature importances, showing which columns the hundreds of trees relied on the most when making their splits.',
        whatToLookFor: [
          'Compare these numbers with your Step 2 base model - they should be better',
          'Note the top 3 features'
        ],
        technicalNotes: 'The feature importance here is average Gini importance across all trees in the forest. Because Random Forest uses random feature subsets at every split, it is very good at exposing the importance of secondary features that might be masked by a strictly dominant feature in a single Decision Tree.',
        commonMistakes: [
          'Always compare tuned metrics with your base model to verify improvement'
        ],
        screenshotInstructions: 'Screenshot showing the tuned model metrics AND the top 3 features'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why did you choose Random Forest for used car price prediction?',
        answer: 'Random Forest is robust to outliers, doesn\'t require feature scaling, and models non-linear relationships well (like how car age affects price exponentially, not linearly). It also naturally prevents overfitting compared to a single Decision Tree.'
      },
      {
        question: 'How does Random Forest prevent overfitting compared to a single Decision Tree?',
        answer: 'A single Decision Tree will grow deep and memorize the training data. Random Forest uses "Bagging" (Bootstrap Aggregation). It builds hundreds of trees, but gives each tree only a random sample of rows and a random subset of features. This ensures trees make different mistakes. By averaging their predictions, the errors cancel out, reducing variance and overfitting.'
      },
      {
        question: 'What do the parameters max_depth and min_samples_split do?',
        answer: 'Max_depth sets a hard limit on how many levels deep a tree can grow, stopping it from learning overly specific, noisy patterns. Min_samples_split dictates that a node must have at least X samples before it is allowed to split further; if set to 5, a node with 4 cars won\'t split, preventing it from memorizing individual cars.'
      },
      {
        question: 'What is the difference between Bagging and Boosting?',
        answer: 'Random Forest uses Bagging: trees are built independently and simultaneously (in parallel), and their outputs are averaged. Gradient Boosting uses Boosting: trees are built sequentially, with each new tree actively trying to correct the errors made by the previous trees.'
      },
      {
        question: 'What do your evaluation metrics (MAE, RMSE, R2) mean?',
        answer: 'MAE is the average absolute error in Lakhs. RMSE is similar but gives higher penalties to large errors. R2 (R-squared) explains the proportion of variance in the car prices that our features account for. An R2 of 0.85 means our model explains 85% of why prices fluctuate.'
      }
    ]
  },
  {
    modelId: 'decision_tree',
    modelName: 'Decision Tree',
    modelDescription: 'A model that predicts the target by learning simple if-then decision rules inferred from the data features.',
    algorithmType: 'Tree-Based',
    memberId: 'wijerathna',
    memberName: 'Wijerathna K.G.C.J.',
    studentId: 'IT25101522',
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Data Loading',
        code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Load data
df = pd.read_csv('final_processed_cars.csv')

# Separate features (X) and target (y)
X = df.drop(columns=['Price', 'Log_Price'])
y = df['Log_Price']

# Split into 80% training and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")`,
        approach: 'First, we import the necessary libraries and the DecisionTreeRegressor. We separate features and our target, Log_Price. Then, we perform an 80/20 train-test split to ensure we have unseen data to test if our tree memorized the data or actually learned patterns.',
        whatToLookFor: [
          'Training shape should be approximately (4779, 12)',
          'Testing shape should be approximately (1195, 12)'
        ],
        technicalNotes: 'Decision Trees do not strictly require log transformation of the target variable to function, as they make non-parametric splits. However, predicting log values still helps prevent large-priced luxury cars from excessively skewing the Mean Squared Error loss function during the tree\'s split calculations.',
        commonMistakes: [
          'If you see KeyError for Log_Price, make sure you uploaded the correct final_processed_cars.csv',
          'Do NOT use Price as target - we use Log_Price'
        ],
        screenshotInstructions: 'Screenshot the cell output showing both training and testing data shapes'
      },
      {
        stepNumber: 2,
        title: 'Base Model Training',
        code: `# Initialize Decision Tree with default parameters
base_model = DecisionTreeRegressor(random_state=42)

# Train the model
base_model.fit(X_train, y_train)

# Predict and convert back from log scale
y_pred_log = base_model.predict(X_test)
y_pred_actual = np.expm1(y_pred_log)
y_test_actual = np.expm1(y_test)

# Calculate metrics
mae = mean_absolute_error(y_test_actual, y_pred_actual)
rmse = root_mean_squared_error(y_test_actual, y_pred_actual)
r2 = r2_score(y_test_actual, y_pred_actual)

print("--- Base Model Evaluation ---")
print(f"MAE: ₹{mae:.2f} Lakhs")
print(f"RMSE: ₹{rmse:.2f} Lakhs")
print(f"R2 Score: {r2:.4f}")`,
        approach: 'We train a basic Decision Tree. By default, scikit-learn lets a Decision Tree grow as deep as it wants until every single "leaf" contains only 1 sample. This almost always leads to massive overfitting. We calculate the errors on the test set after reversing the log scale.',
        whatToLookFor: [
          'MAE should be around 2-3 Lakhs',
          'R2 will likely be worse than ensemble models, around 0.70-0.80'
        ],
        technicalNotes: 'A Decision Tree works like a flowchart. At the top node, it looks for a feature and a threshold (e.g., "Is Power_bhp < 100?") that best splits the data to minimize variance in the two child nodes. It recursively repeats this process for every resulting group until it hits a stopping condition.',
        commonMistakes: [
          'Forgetting np.expm1() will result in meaningless metrics.'
        ],
        screenshotInstructions: 'Screenshot showing all 3 metrics (MAE, RMSE, R2)'
      },
      {
        stepNumber: 3,
        title: 'Hyperparameter Tuning with GridSearchCV',
        code: `from sklearn.model_selection import GridSearchCV, KFold

# Parameter grid
param_grid = {
    'max_depth': [5, 10, 15, None],
    'min_samples_split': [10, 20, 50],
    'min_samples_leaf': [5, 10, 20]
}

# 5-fold cross validation
kf = KFold(n_splits=5, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    estimator=DecisionTreeRegressor(random_state=42),
    param_grid=param_grid,
    cv=kf,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
)

print("Starting Grid Search... pruning the tree")
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"Best Parameters Found: {grid_search.best_params_}")`,
        approach: 'Because default trees overfit, we must "prune" them using GridSearchCV. `max_depth` limits how many if-then steps the tree can take. `min_samples_split` says a node must have X samples to split. `min_samples_leaf` forces every final leaf to have at least X samples, preventing branches that single out a specific weird car.',
        whatToLookFor: [
          'Note down the Best Parameters Found output - you will need these for the viva'
        ],
        technicalNotes: 'Pruning is vital for Decision Trees. An unpruned tree might memorize that "A red 2012 Swift with exactly 42,123 km" costs exactly 3.4 Lakhs, but that rule is useless for unseen data. By increasing `min_samples_leaf`, we force the model to average the price of multiple similar cars, ensuring the rules are generalizable.',
        commonMistakes: [
          'Assuming None for max_depth is always bad - sometimes combined with a high min_samples_leaf, None is optimal.'
        ],
        screenshotInstructions: 'Screenshot showing the Best Parameters Found output'
      },
      {
        stepNumber: 4,
        title: 'Final Evaluation',
        code: `# Predict with best model
y_pred_tuned_log = best_model.predict(X_test)
y_pred_tuned_actual = np.expm1(y_pred_tuned_log)

# Metrics
final_mae = mean_absolute_error(y_test_actual, y_pred_tuned_actual)
final_rmse = root_mean_squared_error(y_test_actual, y_pred_tuned_actual)
final_r2 = r2_score(y_test_actual, y_pred_tuned_actual)

print("--- Tuned Decision Tree Evaluation ---")
print(f"MAE: ₹{final_mae:.2f} Lakhs")
print(f"RMSE: ₹{final_rmse:.2f} Lakhs")
print(f"R2 Score: {final_r2:.4f}")

print("\\n--- Feature Importance ---")
importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': best_model.feature_importances_
})
top_features = importance.sort_values(by='Importance', ascending=False).head(5)
print(top_features)`,
        approach: 'We evaluate the tuned (pruned) tree. We also check Feature Importance. For a single Decision Tree, the most dominant feature (often Power or Age) usually takes the vast majority of the importance score, because the very first split at the root of the tree relies heavily on it.',
        whatToLookFor: [
          'Compare these numbers with your Step 2 base model - they should be better',
          'Note the top 3 features'
        ],
        technicalNotes: 'Decision Trees often have lower R2 scores than Random Forests or Gradient Boosting because a single tree is highly sensitive to small variations in the training data (high variance). However, they are incredibly fast to train and mathematically fully interpretable.',
        commonMistakes: [
          'Always compare tuned metrics with your base model to verify improvement'
        ],
        screenshotInstructions: 'Screenshot showing the tuned model metrics AND the top 3 features'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why did you choose a Decision Tree for this dataset?',
        answer: 'Decision trees are highly interpretable. You can conceptually trace exactly how a prediction was made via if-then rules (e.g., if age < 5 and power > 100). They also handle non-linear relationships well without needing feature scaling.'
      },
      {
        question: 'What is the biggest drawback of a single Decision Tree and how did you mitigate it?',
        answer: 'The biggest drawback is extreme overfitting; a default tree will grow until it perfectly memorizes the training data. I mitigated this by tuning hyperparameters like max_depth, min_samples_split, and min_samples_leaf to "prune" the tree and force it to learn general patterns instead of exact points.'
      },
      {
        question: 'How does the algorithm decide where to make a split?',
        answer: 'The algorithm evaluates all possible splits across all features and chooses the split that results in the greatest reduction of variance (for regression tasks). It wants to create two new child nodes where the car prices inside each node are as similar to each other as possible.'
      },
      {
        question: 'What do min_samples_split and min_samples_leaf do?',
        answer: 'min_samples_split dictates the minimum number of data rows required in a node before it is allowed to split again. min_samples_leaf is stricter: it guarantees that every final "leaf" node must contain at least that many samples, preventing the model from creating rules that apply to only 1 or 2 specific cars.'
      },
      {
        question: 'Why might a Decision Tree perform worse than a Random Forest?',
        answer: 'A single tree has high variance. If the training data changes slightly, the entire tree structure can change dramatically. Random Forest solves this by averaging hundreds of trees trained on random subsets of the data, which stabilizes predictions and improves accuracy.'
      }
    ]
  },
  {
    modelId: 'svr',
    modelName: 'Support Vector Regression (SVR)',
    modelDescription: 'An algorithm that tries to fit a "tube" around the data, aiming to fit as many points as possible within an acceptable margin of error.',
    algorithmType: 'Distance-Based / Kernel Method',
    memberId: 'bandara',
    memberName: 'Bandara U.S.B.N.',
    studentId: 'IT25103405',
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Data Loading',
        code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Load data
df = pd.read_csv('final_processed_cars.csv')

# Separate features (X) and target (y)
X = df.drop(columns=['Price', 'Log_Price'])
y = df['Log_Price']

# Split into 80% training and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# SVR REQUIRES feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")`,
        approach: 'SVR works by calculating geometric distances between data points. Therefore, scaling is CRITICAL. If Engine_cc is 1500 and Age is 5, the model will mistakenly think Engine_cc is 300 times more important. We use `StandardScaler` to force all features to have a mean of 0 and a standard deviation of 1. We `fit_transform` the training data, but strictly only `transform` the test data to prevent data leakage.',
        whatToLookFor: [
          'Training shape should be approximately (4779, 12)',
          'Testing shape should be approximately (1195, 12)'
        ],
        technicalNotes: 'Data Leakage happens if you scale the entire dataset before splitting. If you do that, the scaler uses the test data\'s mean and variance, passing future knowledge to the model. Always scale AFTER splitting, using parameters derived solely from X_train.',
        commonMistakes: [
          'Forgetting to scale data for SVR will result in terrible performance.',
          'Using fit_transform on X_test (causes data leakage).'
        ],
        screenshotInstructions: 'Screenshot the cell output showing shapes'
      },
      {
        stepNumber: 2,
        title: 'Base Model Training',
        code: `# Initialize SVR with default parameters (RBF kernel)
base_model = SVR()

# Train the model ON SCALED DATA
base_model.fit(X_train_scaled, y_train)

# Predict and convert back from log scale
y_pred_log = base_model.predict(X_test_scaled)
y_pred_actual = np.expm1(y_pred_log)
y_test_actual = np.expm1(y_test)

# Calculate metrics
mae = mean_absolute_error(y_test_actual, y_pred_actual)
rmse = root_mean_squared_error(y_test_actual, y_pred_actual)
r2 = r2_score(y_test_actual, y_pred_actual)

print("--- Base Model Evaluation ---")
print(f"MAE: ₹{mae:.2f} Lakhs")
print(f"RMSE: ₹{rmse:.2f} Lakhs")
print(f"R2 Score: {r2:.4f}")`,
        approach: 'We train a baseline Support Vector Regressor using the default "RBF" (Radial Basis Function) kernel. SVR draws a literal mathematical tube (the epsilon-tube) through the multidimensional space of our data. Errors inside the tube are ignored; errors outside the tube are penalized.',
        whatToLookFor: [
          'MAE should be around 1.8 - 2.8 Lakhs',
          'R2 should be around 0.80-0.88'
        ],
        technicalNotes: 'Standard linear regression tries to minimize all error. SVR defines a margin of tolerance (epsilon). As long as a prediction falls within this margin, SVR considers it correct. This makes the model highly robust to small fluctuations and minor outliers in the training data.',
        commonMistakes: [
          'Passing unscaled X_train instead of X_train_scaled into the fit function.'
        ],
        screenshotInstructions: 'Screenshot showing all 3 metrics (MAE, RMSE, R2)'
      },
      {
        stepNumber: 3,
        title: 'Hyperparameter Tuning with GridSearchCV',
        code: `from sklearn.model_selection import GridSearchCV, KFold

# Parameter grid
param_grid = {
    'C': [0.1, 1, 10, 50],
    'gamma': ['scale', 'auto', 0.1, 0.01],
    'kernel': ['rbf']
}

# 5-fold cross validation
kf = KFold(n_splits=5, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    estimator=SVR(),
    param_grid=param_grid,
    cv=kf,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
)

print("Starting Grid Search... tuning C and gamma")
grid_search.fit(X_train_scaled, y_train)

best_model = grid_search.best_estimator_
print(f"Best Parameters Found: {grid_search.best_params_}")`,
        approach: 'SVR has two critical hyperparameters for the RBF kernel. `C` is the regularization parameter (how much you care about points falling outside the tube). `gamma` defines the "reach" of a single training point (how smooth or jagged the decision boundary is). GridSearchCV finds the best combination.',
        whatToLookFor: [
          'Note down the Best Parameters Found output - you will need these for the viva'
        ],
        technicalNotes: 'A high `C` strictly penalizes errors outside the margin, which might lead to overfitting (a very wiggly tube). A low `C` allows more errors, leading to a smoother, flatter tube. A high `gamma` means points only influence things very close to them; a low `gamma` means points have a broad influence.',
        commonMistakes: [
          'GridSearchCV for SVR can be very slow for large datasets. Do not interrupt.'
        ],
        screenshotInstructions: 'Screenshot showing the Best Parameters Found output'
      },
      {
        stepNumber: 4,
        title: 'Final Evaluation',
        code: `# Predict with best model
y_pred_tuned_log = best_model.predict(X_test_scaled)
y_pred_tuned_actual = np.expm1(y_pred_tuned_log)

# Metrics
final_mae = mean_absolute_error(y_test_actual, y_pred_tuned_actual)
final_rmse = root_mean_squared_error(y_test_actual, y_pred_tuned_actual)
final_r2 = r2_score(y_test_actual, y_pred_tuned_actual)

print("--- Tuned SVR Evaluation ---")
print(f"MAE: ₹{final_mae:.2f} Lakhs")
print(f"RMSE: ₹{final_rmse:.2f} Lakhs")
print(f"R2 Score: {final_r2:.4f}")
print("\\nNote: SVR with RBF kernel does not provide direct feature importances.")`,
        approach: 'We evaluate the final SVR model. Note that unlike linear models (which give coefficients) or tree models (which give importances), SVR with an RBF kernel transforms data into infinite-dimensional space. Because of this mathematical trick, we cannot easily extract direct "Feature Importances" to see which column mattered most.',
        whatToLookFor: [
          'Compare these numbers with your Step 2 base model - they should be better'
        ],
        technicalNotes: 'The RBF (Radial Basis Function) Kernel trick allows SVR to solve non-linear problems. Imagine points on a flat piece of paper that cannot be separated by a straight line. The kernel trick mathematically "warps" the paper into 3D or higher dimensions, finds a flat plane to separate the points, and projects it back to 2D as a curved boundary.',
        commonMistakes: [
          'Always compare tuned metrics with your base model to verify improvement'
        ],
        screenshotInstructions: 'Screenshot showing the tuned model metrics'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why is feature scaling absolutely mandatory for SVR?',
        answer: 'SVR operates mathematically by calculating distances between data points. If we don\'t scale, a feature like Engine_cc (e.g., 1500) will totally overpower a feature like Car_Age (e.g., 5). Scaling ensures all features operate on the same scale, usually with a mean of 0 and a standard deviation of 1.'
      },
      {
        question: 'How did you prevent data leakage when scaling the data?',
        answer: 'I used fit_transform() strictly on the training data. This calculates the mean and standard deviation of X_train and scales it. For the test data, I only used transform(), which applies the training data\'s parameters to the test data. If I had fit the scaler on the whole dataset before splitting, the model would have had "future knowledge" of the test set.'
      },
      {
        question: 'What is the "kernel trick" in SVR?',
        answer: 'When data relationships are highly non-linear, drawing a straight line or plane won\'t work. The kernel trick (like RBF) mathematically maps the data into a higher-dimensional space where a linear plane *can* fit the data. It does this without the immense computing power needed to physically transform every data point.'
      },
      {
        question: 'What do the parameters C and gamma control?',
        answer: 'C is the penalty for points falling outside the acceptable margin (epsilon tube). A high C creates a complex model that tries to capture every point; a low C creates a smoother, more generalized model. Gamma controls the influence of individual points. A low gamma means points have far-reaching influence (smooth); a high gamma means points only influence things very close to them (jagged).'
      },
      {
        question: 'Why doesn\'t SVR output Feature Importances like Random Forest?',
        answer: 'Because we use the RBF kernel, the data is implicitly mapped into an infinite-dimensional space to find a fit. The final model is represented by complex mathematical weights assigned to specific data rows (the support vectors), not weights assigned to our original input features. Therefore, we cannot easily trace back exactly how much influence a single column like Power_bhp had.'
      }
    ]
  },
  {
    modelId: 'knn',
    modelName: 'K-Nearest Neighbors (KNN)',
    modelDescription: 'An algorithm that predicts a car\'s price by finding the "K" most similar cars in the historical data and averaging their prices.',
    algorithmType: 'Distance-Based',
    memberId: 'wijesinghe',
    memberName: 'Wijesinghe W.A.D.M.C.L.',
    studentId: 'IT25100607',
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Data Loading',
        code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Load data
df = pd.read_csv('final_processed_cars.csv')

# Separate features (X) and target (y)
X = df.drop(columns=['Price', 'Log_Price'])
y = df['Log_Price']

# Split into 80% training and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# KNN REQUIRES feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")`,
        approach: 'KNN operates by calculating the physical distance between cars using their features (like coordinates on a map). If we do not scale the data, features with large numbers (Kilometers_Driven: 50,000) will dwarf small numbers (Age: 5). We use StandardScaler, strictly fitting on the training data to prevent data leakage.',
        whatToLookFor: [
          'Training shape should be approximately (4779, 12)',
          'Testing shape should be approximately (1195, 12)'
        ],
        technicalNotes: 'Data Leakage happens if you scale the entire dataset before splitting. If you do that, the scaler uses the test data\'s mean and variance, passing future knowledge to the model. Always scale AFTER splitting.',
        commonMistakes: [
          'Forgetting to scale data for KNN will result in terrible performance.',
          'Using fit_transform on X_test (causes data leakage).'
        ],
        screenshotInstructions: 'Screenshot the cell output showing shapes'
      },
      {
        stepNumber: 2,
        title: 'Base Model Training',
        code: `# Initialize KNN with default parameters (n_neighbors=5)
base_model = KNeighborsRegressor()

# Train the model ON SCALED DATA
base_model.fit(X_train_scaled, y_train)

# Predict and convert back from log scale
y_pred_log = base_model.predict(X_test_scaled)
y_pred_actual = np.expm1(y_pred_log)
y_test_actual = np.expm1(y_test)

# Calculate metrics
mae = mean_absolute_error(y_test_actual, y_pred_actual)
rmse = root_mean_squared_error(y_test_actual, y_pred_actual)
r2 = r2_score(y_test_actual, y_pred_actual)

print("--- Base Model Evaluation ---")
print(f"MAE: ₹{mae:.2f} Lakhs")
print(f"RMSE: ₹{rmse:.2f} Lakhs")
print(f"R2 Score: {r2:.4f}")`,
        approach: 'We train a base KNN model. By default, it looks at the 5 most similar cars in the training set (`n_neighbors=5`). The `.fit()` step for KNN is essentially just memorizing the scaled training data. The heavy lifting happens during `.predict()`, where it measures the distance from the new test car to every single car in the training set.',
        whatToLookFor: [
          'MAE should be around 2-3 Lakhs',
          'R2 should be around 0.75-0.85'
        ],
        technicalNotes: 'KNN is known as a "lazy learner" because it doesn\'t actually calculate a mathematical formula during training. It just stores the data. This makes training instantaneous, but predicting slow, especially on large datasets.',
        commonMistakes: [
          'Passing unscaled X_train instead of X_train_scaled into the fit function.'
        ],
        screenshotInstructions: 'Screenshot showing all 3 metrics (MAE, RMSE, R2)'
      },
      {
        stepNumber: 3,
        title: 'Hyperparameter Tuning with GridSearchCV',
        code: `from sklearn.model_selection import GridSearchCV, KFold

# Parameter grid
param_grid = {
    'n_neighbors': [3, 5, 7, 9, 11, 15],
    'weights': ['uniform', 'distance'],
    'p': [1, 2] # 1=Manhattan distance, 2=Euclidean distance
}

# 5-fold cross validation
kf = KFold(n_splits=5, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    estimator=KNeighborsRegressor(),
    param_grid=param_grid,
    cv=kf,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
)

print("Starting Grid Search... tuning K and distance metrics")
grid_search.fit(X_train_scaled, y_train)

best_model = grid_search.best_estimator_
print(f"Best Parameters Found: {grid_search.best_params_}")`,
        approach: 'We tune the core parameters of KNN. `n_neighbors` is how many cars to look at. `weights` decides how to average their prices: "uniform" means all K cars have equal say, "distance" means a car that is mathematically closer has more influence on the price. `p` changes how distance is measured (straight line vs grid-like path).',
        whatToLookFor: [
          'Note down the Best Parameters Found output - you will need these for the viva'
        ],
        technicalNotes: 'Choosing K is a balance. If K=1, the model is overly sensitive to noise (a single weirdly priced car ruins the prediction). If K=100, the model oversmoothes and just predicts the average price of the entire dataset.',
        commonMistakes: [
          'Assuming a higher K is always better.'
        ],
        screenshotInstructions: 'Screenshot showing the Best Parameters Found output'
      },
      {
        stepNumber: 4,
        title: 'Final Evaluation',
        code: `# Predict with best model
y_pred_tuned_log = best_model.predict(X_test_scaled)
y_pred_tuned_actual = np.expm1(y_pred_tuned_log)

# Metrics
final_mae = mean_absolute_error(y_test_actual, y_pred_tuned_actual)
final_rmse = root_mean_squared_error(y_test_actual, y_pred_tuned_actual)
final_r2 = r2_score(y_test_actual, y_pred_tuned_actual)

print("--- Tuned KNN Evaluation ---")
print(f"MAE: ₹{final_mae:.2f} Lakhs")
print(f"RMSE: ₹{final_rmse:.2f} Lakhs")
print(f"R2 Score: {final_r2:.4f}")
print("\\nNote: KNN does not provide feature importances.")`,
        approach: 'We evaluate the tuned model. Like SVR, KNN does not provide feature importances. It doesn\'t figure out if Age is more important than Power; it simply calculates overall multi-dimensional distance across all scaled features equally.',
        whatToLookFor: [
          'Compare these numbers with your Step 2 base model - they should be better'
        ],
        technicalNotes: 'Because KNN suffers from the "Curse of Dimensionality" (distance metrics lose meaning in very high dimensional spaces), it works best when you have a relatively small number of highly relevant features.',
        commonMistakes: [
          'Always compare tuned metrics with your base model to verify improvement'
        ],
        screenshotInstructions: 'Screenshot showing the tuned model metrics'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why is feature scaling absolutely mandatory for KNN?',
        answer: 'KNN relies entirely on calculating distance between points to find neighbors. Without scaling, a feature with large numbers like Kilometers_Driven (e.g., 50,000) will mathematically overpower a small feature like Car_Age (e.g., 5). Scaling ensures all features contribute equally to the distance calculation.'
      },
      {
        question: 'How did you prevent data leakage when scaling?',
        answer: 'I used fit_transform() strictly on the training data. This calculates the mean and standard deviation of the training set and scales it. For the test data, I only used transform(), applying those exact training parameters. If I scaled the whole dataset first, the test data\'s statistics would leak into the training phase.'
      },
      {
        question: 'What is a "lazy learner" and why is KNN considered one?',
        answer: 'A lazy learner does not build a mathematical model during the training phase. When you call .fit() on KNN, it simply stores the data in memory. All the computation happens during .predict(), where it must calculate the distance from the new point to every single stored training point.'
      },
      {
        question: 'What does the "weights" parameter do in your GridSearchCV?',
        answer: 'If weights is set to "uniform", all K nearest neighbors get an equal vote in predicting the target price. If set to "distance", closer neighbors have a proportionally higher influence on the predicted price than neighbors that are further away.'
      },
      {
        question: 'What is the curse of dimensionality and how does it affect KNN?',
        answer: 'The curse of dimensionality means that as you add more features (dimensions), the concept of "distance" becomes less meaningful because all points become roughly equidistant from each other. KNN struggles on datasets with hundreds of columns, but works well on our dataset which has only about 12 features.'
      }
    ]
  }
];

export function getModelByMemberId(memberId: string): ModelData | undefined {
  return models.find(m => m.memberId === memberId);
}

export function getModelById(modelId: string): ModelData | undefined {
  return models.find(m => m.modelId === modelId);
}
