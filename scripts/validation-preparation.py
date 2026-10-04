# Import libraries
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Keep the final test split separate, then split training for tuning
raw = pd.read_csv('train-data.csv')
outer_train, holdout = train_test_split(raw, test_size=0.2, random_state=42)
training, validation = train_test_split(outer_train, test_size=0.25, random_state=42)

# Find the kilometre cutoff using training rows only
q1, q3 = training['Kilometers_Driven'].quantile([0.25, 0.75])
limit = q3 + 3 * (q3 - q1)
training = training[training['Kilometers_Driven'] <= limit].copy()
validation = validation[validation['Kilometers_Driven'] <= limit].copy()
# Extract numeric values and create age and ownership features
for frame in [training, validation]:
    for source, target in [('Mileage', 'Mileage_kmpl'), ('Engine', 'Engine_cc'), ('Power', 'Power_bhp')]:
        frame[target] = frame[source].str.extract(r'([\d.]+)').astype(float)
    frame['Car_Age'] = 2024 - frame['Year']
    frame['Owner_Type_Code'] = frame['Owner_Type'].map(
        {'First': 1, 'Second': 2, 'Third': 3, 'Fourth & Above': 4}).fillna(1)
# Use training medians to fill missing values
fill_cols = ['Mileage_kmpl', 'Engine_cc', 'Power_bhp', 'Seats']
medians = training[fill_cols].median()
cols = ['Kilometers_Driven', 'Seats', 'Mileage_kmpl', 'Engine_cc', 'Power_bhp',
        'Car_Age', 'Owner_Type_Code', 'Fuel_Type', 'Transmission']
categories = ['Fuel_Type', 'Transmission']
for frame in [training, validation]:
    frame[fill_cols] = frame[fill_cols].fillna(medians)
# Use the training categories when encoding validation data
for col in categories:
    validation[col] = pd.Categorical(validation[col], categories=sorted(training[col].dropna().unique()))
# Encode fuel type and transmission
a = pd.get_dummies(training[cols], columns=categories, drop_first=True)
b = pd.get_dummies(validation[cols], columns=categories, drop_first=True).reindex(columns=a.columns, fill_value=False)
# Fit scaling on training data and apply it to validation data
scale_cols = ['Kilometers_Driven', 'Car_Age', 'Mileage_kmpl', 'Engine_cc', 'Power_bhp']
scaler = StandardScaler()
a[scale_cols] = scaler.fit_transform(a[scale_cols])
b[scale_cols] = scaler.transform(b[scale_cols])

# Add price targets and save the two tuning files
a['Price'] = training['Price']
a['Log_Price'] = np.log1p(training['Price'])
b['Price'] = validation['Price']
b['Log_Price'] = np.log1p(validation['Price'])
a.to_csv('tuning_train.csv', index=False)
b.to_csv('tuning_validation.csv', index=False)
print(a.shape)
print(b.shape)
