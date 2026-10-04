from pathlib import Path
import json
import os
import tempfile
import zipfile
import nbformat

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT.parent / 'Data-Preprosses'
downloads = ROOT / 'public/downloads'
configs = json.loads((ROOT / 'scripts/model-config.json').read_text(encoding='utf-8'))
preparation = (ROOT / 'scripts/validation-preparation.py').read_text(encoding='utf-8')
with tempfile.TemporaryDirectory() as temporary:
    work = Path(temporary)
    (work / 'train-data.csv').write_bytes((DATA / 'data/raw/train-data.csv').read_bytes())
    previous = Path.cwd()
    os.chdir(work)
    values = {}
    exec(preparation, values)
    os.chdir(previous)
    assert not set(values['training'].index) & set(values['validation'].index)
    assert not set(values['outer_train'].index) & set(values['holdout'].index)
    with zipfile.ZipFile(downloads / 'colab-starter-files.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for name in ['tuning_train.csv', 'tuning_validation.csv']:
            z.write(work / name, name)
        for name in ['processed_train.csv', 'processed_holdout.csv', 'processed_university_test.csv']:
            z.write(DATA / 'results/outputs' / name, name)
    manifest = {'protocol': 'cars12-v3-validation42', 'tuningRows': len(values['a']), 'validationRows': len(values['b'])}
(ROOT / 'src/lib/data-protocol.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
nbformat.write(nbformat.v4.new_notebook(cells=[
    nbformat.v4.new_markdown_cell('# Shared validation split\n\nSplit the original training portion again to create a development training set and a validation set. Medians, the kilometre cutoff, category levels and scaling are learned from development training only. The Assignment 1 final training and holdout files are kept as they are. This notebook reproduces the two tuning files in the starter ZIP. It requires train-data.csv.'),
    nbformat.v4.new_code_cell(preparation)
]), downloads / 'shared-validation-preparation.ipynb')

setup = '''# Import libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Load training, validation and test data
tuning_train = pd.read_csv('tuning_train.csv')
validation = pd.read_csv('tuning_validation.csv')
train = pd.read_csv('processed_train.csv')
test = pd.read_csv('processed_holdout.csv')

# Check the number of rows and columns
print(tuning_train.shape)
print(validation.shape)
print(train.shape)
print(test.shape)'''

inputs = '''# Separate features and targets for tuning
X_train = tuning_train.drop(columns=['Price', 'Log_Price'])
y_train = tuning_train['Price']
y_train_log = tuning_train['Log_Price']

# Prepare the validation set
X_val = validation.drop(columns=['Price', 'Log_Price'])
y_val = validation['Price']

# Prepare the full training set for the selected model
X_final = train.drop(columns=['Price', 'Log_Price'])
y_final = train['Price']
y_final_log = train['Log_Price']

# Prepare the labelled test set
X_test = test.drop(columns=['Price', 'Log_Price'])
y_test = test['Price']

print(X_train.shape)
print(X_val.shape)
print(X_test.shape)'''

evaluation = '''# Select the model with the lowest validation RMSE
best_model = models[best_index]

# Retrain on the full training set and predict test prices
# Indices 1 and 3 are the log-price variants
if best_index in [1, 3]:
    best_model.fit(X_final, y_final_log)
    test_prediction = np.expm1(best_model.predict(X_test))
    train_prediction = np.expm1(best_model.predict(X_final))
else:
    best_model.fit(X_final, y_final)
    test_prediction = best_model.predict(X_test)
    train_prediction = best_model.predict(X_final)

# Calculate scores in the original price units
rmse = np.sqrt(mean_squared_error(y_test, test_prediction))
mae = mean_absolute_error(y_test, test_prediction)
r2 = r2_score(y_test, test_prediction)
train_rmse = np.sqrt(mean_squared_error(y_final, train_prediction))

print('Training RMSE:', train_rmse)
print('Test RMSE:', rmse)
print('Test MAE:', mae)
print('Test R2:', r2)

# Plot actual prices against predicted prices
plt.figure()
plt.scatter(y_test, test_prediction, alpha=0.4)
plt.plot([0, y_test.max()], [0, y_test.max()], 'r--')
plt.xlabel('Actual price (INR lakhs)')
plt.ylabel('Predicted price (INR lakhs)')
plt.title('Actual and predicted prices')
plt.savefig('prediction_plot.png', dpi=150)
plt.show()

# Plot residuals to check the prediction errors
plt.figure()
plt.scatter(test_prediction, y_test - test_prediction, alpha=0.4)
plt.axhline(0, color='red', linestyle='--')
plt.xlabel('Predicted price (INR lakhs)')
plt.ylabel('Actual minus predicted price (INR lakhs)')
plt.title('Prediction errors')
plt.savefig('residual_plot.png', dpi=150)
plt.show()'''

common_viva = [
    {'question':'What are the training, validation and test sets for?', 'answer':'Development training teaches the four variants. Validation compares them and selects the settings and target transformation. The selected version is retrained on the full Assignment 1 training set and evaluated once on its labelled holdout. All members use the same files.'},
    {'question':'Why are there two extra tuning files?', 'answer':'Splitting already-imputed and scaled data would let validation rows influence training medians and scaling. The extra files were split from raw outer-training rows first and processed using development-training statistics only. The shared preparation notebook shows every step. Assignment 1 is not replaced.'},
    {'question':'Why compare Price and Log_Price?', 'answer':'This is the preprocessing variation: the target is used either directly or as log1p(Price). Logs compress large prices. np.expm1 reverses the transformation before computing errors. Both versions are scored in price units.'},
    {'question':'What does manual tuning mean here?', 'answer':'We compare two explicit parameter settings, each with two target choices. That gives four variants of one algorithm. The lowest validation RMSE wins. This is a small manual search, not an exhaustive search and not cross-validation.'},
    {'question':'Why use RMSE, MAE and R²?', 'answer':'RMSE is the main metric because larger price errors receive a larger penalty. MAE is average absolute error. Both use INR lakhs. R² compares squared error with predicting the evaluation-set mean. It can be negative and is not percentage accuracy.'},
    {'question':'How does the group compare its six algorithms?', 'answer':'Compare the chosen variants on the same validation set, using validation RMSE to select the group model and its holdout scores to assess generalization. You can also report the observed holdout ranking, but choosing from it makes it part of model selection.'},
    {'question':'What are the limitations?', 'answer':'One validation split is less stable than repeated cross-validation, and four variants cover only a small set of possibilities. Scores describe the kilometre-filtered population. The original mileage-unit and zero-value limitations remain, and earlier EDA saw the full dataset. These historical Indian prices do not establish current Sri Lankan prices.'},
    {'question':'Can we evaluate university test predictions?', 'answer':'The university test file has no Price labels. We preserve all 1,234 rows and produce predictions, but cannot calculate its RMSE, MAE or R².'}
]

guides = []
for config in configs:
    model = {k: config[k] for k in ['modelId','modelName','modelDescription','algorithmType','memberId','memberName','studentId']}
    code_blocks = []
    for number, constructor, target in [(1,config['constructor'],'Price'), (2,config['constructor'],'Log_Price'), (3,config['tuned'],'Price'), (4,config['tuned'],'Log_Price')]:
        label = ('Default' if number < 3 else 'Changed settings') + ' + ' + target
        prediction = f'model{number}.predict(X_val)'
        if target == 'Log_Price':
            prediction = f'np.expm1({prediction})'
        code_blocks.append(f'''# Train with {'default' if number < 3 else 'changed'} settings using {'log prices' if target == 'Log_Price' else 'prices'}
model{number} = {constructor}
model{number}.fit(X_train, {'y_train_log' if target == 'Log_Price' else 'y_train'})

# {'Predict validation prices and reverse the log transformation' if target == 'Log_Price' else 'Predict validation prices'}
prediction{number} = {prediction}

# Calculate validation scores
rmse{number} = np.sqrt(mean_squared_error(y_val, prediction{number}))
mae{number} = mean_absolute_error(y_val, prediction{number})
r2_{number} = r2_score(y_val, prediction{number})
print('{label}:', rmse{number}, mae{number}, r2_{number})''')
    baseline = code_blocks[0] + '\n\n' + code_blocks[1]
    tuning = code_blocks[2] + '\n\n' + code_blocks[3] + '''

# Compare the four variants
comparison = pd.DataFrame({
    'Variant': ['Default + Price', 'Default + Log_Price',
                'Changed settings + Price', 'Changed settings + Log_Price'],
    'RMSE': [rmse1, rmse2, rmse3, rmse4],
    'MAE': [mae1, mae2, mae3, mae4],
    'R2': [r2_1, r2_2, r2_3, r2_4]
})
print(comparison.sort_values('RMSE'))
comparison.to_csv('variant_comparison.csv', index=False)

# Choose the variant with the lowest validation RMSE
models = [model1, model2, model3, model4]
best_index = comparison['RMSE'].idxmin()
print('Selected variant:', comparison.loc[best_index, 'Variant'])'''
    export = f'''# Save the selected variant and evaluation scores
result = pd.DataFrame({{
    'Model': [{config['modelName']!r}],
    'Model_ID': [{config['modelId']!r}],
    'Student_ID': [{config['studentId']!r}],
    'Protocol': ['cars12-v3-validation42'],
    'Variant': [comparison.loc[best_index, 'Variant']],
    'Validation_RMSE': [comparison.loc[best_index, 'RMSE']],
    'Validation_MAE': [comparison.loc[best_index, 'MAE']],
    'Validation_R2': [comparison.loc[best_index, 'R2']],
    'Train_RMSE': [train_rmse],
    'Holdout_RMSE': [rmse], 'Holdout_MAE': [mae], 'Holdout_R2': [r2],
    'Train_Rows': [len(X_final)], 'Holdout_Rows': [len(X_test)],
    'Tuning_Rows': [len(X_train)], 'Validation_Rows': [len(X_val)],
    'Features': [X_final.shape[1]]
}})
result.to_csv('{config['modelId']}_result.csv', index=False)

# Predict prices for the unlabelled university data
university = pd.read_csv('processed_university_test.csv')
university_prediction = best_model.predict(university)
if best_index in [1, 3]:
    university_prediction = np.expm1(university_prediction)

# Keep predictions in the same order as the input rows
predictions = pd.DataFrame({{
    'Row_Number': range(1, len(university) + 1),
    'Predicted_Price_INR_Lakhs': university_prediction
}})
predictions.to_csv('{config['modelId']}_university_predictions.csv', index=False)
print(result.T)
print(predictions.head())
print(predictions.shape)'''
    data = [
        ('Load the data', setup + '\n\n' + config['importCode'],
         'Upload the five CSV files from the starter ZIP to Colab. Run the cells in order.',
         [f"Tuning training: ({manifest['tuningRows']}, 14). Validation: ({manifest['validationRows']}, 14).", 'Full training: (4777, 14). Labelled test: (1194, 14).'],
         'tuning_train.csv and tuning_validation.csv are an extra split within the original training portion. They use development-training medians and scaling only. processed_train.csv and processed_holdout.csv are the existing Assignment 1 files. processed_university_test.csv is used for prediction at the end.',
         ['Do not split the combined processed archive again.','Keep all members on the same starter files.'], 'Capture the four dataset shapes.'),
        ('Separate inputs and prices', inputs,
         'X contains the car features, and y contains the price being predicted. Keep both Price and Log_Price out of X. The two target choices let you compare a preprocessing variation without changing the original 12 features.',
         ['Each X table has 12 columns.','Development training and validation are used for choosing a variant. The labelled test stays unused until Step 5.'],
         'Log_Price was created with np.log1p(Price). For a log-target model, np.expm1(prediction) returns its prediction to the price scale. RMSE and MAE are always calculated on that price scale.',
         ['Including Price or Log_Price in X leaks the answer.','Do not apply another scaler to already processed features.'], 'Capture the input shapes.'),
        ('Train the two baseline variants', baseline,
         config['intuition'] + '\n\nmodel1 uses Price. model2 uses Log_Price. Both use default parameter settings and the same development-training rows. The code trains, predicts and calculates RMSE, MAE and R² directly.',
         ['Two lines show validation RMSE, MAE and R², in that order.','Lower RMSE and MAE are better. Higher R² is better.'],
         'fit(X, y) trains the estimator. predict(X_val) estimates validation prices. np.sqrt(mean_squared_error(...)) calculates RMSE. Log predictions are reversed before scoring.',
         ['Do not score log predictions directly against prices.','R² is not classification accuracy.'], 'Capture both baseline scores.'),
        ('Try changed settings and compare', tuning,
         config['parameters'] + '\n\nmodel3 and model4 repeat the Price and Log_Price comparison with those changed settings. The pandas table compares all four variants, and idxmin selects the row with the lowest validation RMSE.',
         ['Four variants of your one assigned algorithm.','The selected row has the lowest validation RMSE. Default settings are allowed to win.'],
         'This is manual tuning. The list models has the same order as the comparison table: index 0 means model1, 1 means model2, 2 means model3 and 3 means model4. If RMSE ties exactly, idxmin keeps the first row. The small search is a limitation to discuss.',
         ['Changed settings are not guaranteed to be better.','Do not choose or change settings using final test scores.'], 'Capture the comparison and chosen variant.'),
        ('Evaluate on the labelled test set', evaluation,
         'Retrain the selected model using the full Assignment 1 training file. Evaluate it once on processed_holdout.csv. This uses all outer-training rows, including the earlier validation portion, while the labelled test stays separate.',
         ['Training RMSE and the three final test scores.','Points near the diagonal are closer predictions.','Positive residuals mean the model underpredicted.'],
         'Indices 1 and 3 identify log-target variants. Their predictions need np.expm1. A large training/holdout gap can indicate overfitting; distance-weighted KNN can have tiny training error because a training row is its own nearest neighbour.',
         ['Do not return to Step 4 to chase better test scores.','Scores apply to the retained kilometre range.'], 'Capture final scores and both plots.'),
        ('Save results and make predictions', export,
         'Save the selected validation scores and final holdout scores for the group. Then predict the university rows. Download the notebook, variant_comparison.csv, your result CSV, both plot files and predictions from Colab’s Files panel.',
         ['A one-row result CSV named after your model.','1,234 prediction rows in their original file order.'],
         'Validation scores describe the chosen variant before full-training refitting. Holdout scores describe the refitted model. The university file has no true prices, so cannot produce evaluation metrics. Row_Number is the 1-based input row position, not a source dataset ID.',
         ['Use the one-row result CSV on the group comparison page.','Compare validation to validation and holdout to holdout.'], 'Capture the result table and prediction shape.'),
    ]
    model['steps'] = [dict(stepNumber=i+1,title=t,code=c,approach=a,whatToLookFor=w,technicalNotes=n,commonMistakes=m,screenshotInstructions=s) for i,(t,c,a,w,n,m,s) in enumerate(data)]
    model['vivaQuestions'] = [dict(question='How does your model work?',answer=config['intuition']), dict(question='Which parameters did you change?',answer=config['parameters']), dict(question='What are this model’s limitations?',answer=config['limitations'])] + common_viva
    guides.append(model)
    cells = [nbformat.v4.new_markdown_cell(f"# {config['modelName']}\n\n{config['memberName']} — {config['studentId']}\n\nUsed-car price prediction")]
    for step in model['steps']:
        cells += [nbformat.v4.new_markdown_cell('## ' + step['title']), nbformat.v4.new_code_cell(step['code'])]
    notebook = nbformat.v4.new_notebook(cells=cells, metadata={'kernelspec': {'name':'python3','display_name':'Python 3','language':'python'}})
    nbformat.write(notebook, downloads / f"{config['modelId']}.ipynb")
(ROOT / 'src/lib/guide-content.json').write_text(json.dumps(guides, indent=2, ensure_ascii=False), encoding='utf-8')
print('Generated six simple member notebooks and one shared preparation notebook.')
